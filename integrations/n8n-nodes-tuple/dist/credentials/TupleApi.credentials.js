"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TupleApi = void 0;
class TupleApi {
    constructor() {
        this.name = 'tupleApi';
        this.displayName = 'Tuple API';
        this.icon = {
            light: 'file:../nodes/Tuple/tuple-logo.png',
            dark: 'file:../nodes/Tuple/tuple-logo.dark.png',
        };
        this.documentationUrl = 'https://tuple.ai/docs';
        this.properties = [
            {
                displayName: 'Base URL',
                name: 'baseUrl',
                type: 'string',
                default: 'https://app.tuple.ai',
                placeholder: 'https://app.tuple.ai',
                required: true,
                description: 'Tuple Cloud URL or your self-hosted Tuple URL',
            },
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                required: true,
                description: 'Tuple agent API key, usually starting with tuple_',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    Authorization: '=Bearer {{$credentials.apiKey}}',
                },
            },
        };
        this.test = {
            request: {
                method: 'GET',
                baseURL: '={{$credentials.baseUrl}}',
                url: '/v1/models',
                headers: {
                    Authorization: '=Bearer {{$credentials.apiKey}}',
                },
            },
        };
    }
}
exports.TupleApi = TupleApi;
//# sourceMappingURL=TupleApi.credentials.js.map