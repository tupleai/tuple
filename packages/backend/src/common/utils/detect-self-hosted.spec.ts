import { getContainerHostAlias, isSelfHosted } from './detect-self-hosted';
import * as fs from 'fs';

jest.mock('fs');

const mockedExistsSync = jest.mocked(fs.existsSync);

describe('isSelfHosted', () => {
  const originalMode = process.env['TUPLE_MODE'];
  const originalK8s = process.env['KUBERNETES_SERVICE_HOST'];

  afterEach(() => {
    if (originalMode === undefined) delete process.env['TUPLE_MODE'];
    else process.env['TUPLE_MODE'] = originalMode;
    if (originalK8s === undefined) delete process.env['KUBERNETES_SERVICE_HOST'];
    else process.env['KUBERNETES_SERVICE_HOST'] = originalK8s;
    mockedExistsSync.mockReset();
  });

  it('returns true when TUPLE_MODE is "selfhosted"', () => {
    process.env['TUPLE_MODE'] = 'selfhosted';
    expect(isSelfHosted()).toBe(true);
  });

  it('returns true when TUPLE_MODE is legacy "local"', () => {
    process.env['TUPLE_MODE'] = 'local';
    expect(isSelfHosted()).toBe(true);
  });

  it('returns false when TUPLE_MODE is "cloud"', () => {
    process.env['TUPLE_MODE'] = 'cloud';
    delete process.env['KUBERNETES_SERVICE_HOST'];
    expect(isSelfHosted()).toBe(false);
  });

  it('returns false when TUPLE_MODE is "cloud" even inside Docker', () => {
    process.env['TUPLE_MODE'] = 'cloud';
    delete process.env['KUBERNETES_SERVICE_HOST'];
    mockedExistsSync.mockReturnValue(true);
    expect(isSelfHosted()).toBe(false);
  });

  it('auto-detects Docker via /.dockerenv when TUPLE_MODE is not set', () => {
    delete process.env['TUPLE_MODE'];
    delete process.env['KUBERNETES_SERVICE_HOST'];
    mockedExistsSync.mockImplementation((p) => p === '/.dockerenv');
    expect(isSelfHosted()).toBe(true);
    expect(mockedExistsSync).toHaveBeenCalledWith('/.dockerenv');
  });

  it('auto-detects Podman via /run/.containerenv when TUPLE_MODE is not set', () => {
    delete process.env['TUPLE_MODE'];
    delete process.env['KUBERNETES_SERVICE_HOST'];
    mockedExistsSync.mockImplementation((p) => p === '/run/.containerenv');
    expect(isSelfHosted()).toBe(true);
  });

  it('auto-detects Kubernetes via KUBERNETES_SERVICE_HOST', () => {
    delete process.env['TUPLE_MODE'];
    process.env['KUBERNETES_SERVICE_HOST'] = '10.0.0.1';
    mockedExistsSync.mockReturnValue(false);
    expect(isSelfHosted()).toBe(true);
  });

  it('returns false when no container marker is present and TUPLE_MODE is not set', () => {
    delete process.env['TUPLE_MODE'];
    delete process.env['KUBERNETES_SERVICE_HOST'];
    mockedExistsSync.mockReturnValue(false);
    expect(isSelfHosted()).toBe(false);
  });

  it('returns false when existsSync throws', () => {
    delete process.env['TUPLE_MODE'];
    delete process.env['KUBERNETES_SERVICE_HOST'];
    mockedExistsSync.mockImplementation(() => {
      throw new Error('permission denied');
    });
    expect(isSelfHosted()).toBe(false);
  });
});

describe('getContainerHostAlias', () => {
  afterEach(() => {
    mockedExistsSync.mockReset();
  });

  it("returns 'host.docker.internal' when /.dockerenv exists", () => {
    mockedExistsSync.mockImplementation((p) => p === '/.dockerenv');
    expect(getContainerHostAlias()).toBe('host.docker.internal');
  });

  it("returns 'host.containers.internal' when only /run/.containerenv exists (Podman)", () => {
    mockedExistsSync.mockImplementation((p) => p === '/run/.containerenv');
    expect(getContainerHostAlias()).toBe('host.containers.internal');
  });

  it("prefers 'host.docker.internal' when both markers exist (Docker writes both in some setups)", () => {
    mockedExistsSync.mockReturnValue(true);
    expect(getContainerHostAlias()).toBe('host.docker.internal');
  });

  it("returns 'localhost' when no marker exists", () => {
    mockedExistsSync.mockReturnValue(false);
    expect(getContainerHostAlias()).toBe('localhost');
  });

  it("returns 'localhost' when existsSync throws", () => {
    mockedExistsSync.mockImplementation(() => {
      throw new Error('EACCES');
    });
    expect(getContainerHostAlias()).toBe('localhost');
  });
});
