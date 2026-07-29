import type { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';
export declare class TupleApi implements ICredentialType {
    name: string;
    displayName: string;
    icon: {
        readonly light: "file:../nodes/Tuple/tuple-logo.png";
        readonly dark: "file:../nodes/Tuple/tuple-logo.dark.png";
    };
    documentationUrl: string;
    properties: INodeProperties[];
    authenticate: IAuthenticateGeneric;
    test: ICredentialTestRequest;
}
