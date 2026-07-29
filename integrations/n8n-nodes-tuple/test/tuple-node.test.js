const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
	Tuple,
	parseTupleResponse,
	parseServerSentEvents,
	withoutRouteManagedStream,
} = require('../dist/nodes/Tuple/Tuple.node.js');

test('keeps codex metadata valid in package and repository files', () => {
	const expectedNode = `${require('../package.json').name}.${new Tuple().description.name}`;
	const allowedFields = new Set([
		'alias',
		'categories',
		'codexVersion',
		'node',
		'nodeVersion',
		'resources',
	]);
	const codexFiles = [
		'../nodes/Tuple/Tuple.node.json',
		'../dist/nodes/Tuple/Tuple.node.json',
		'../../../nodes/Tuple/Tuple.node.json',
	];

	for (const relativePath of codexFiles) {
		const codex = JSON.parse(fs.readFileSync(path.join(__dirname, relativePath), 'utf8'));

		assert.equal(codex.node, expectedNode);
		assert.deepEqual(codex.categories, ['Development']);
		assert.ok(Object.keys(codex).every((field) => allowedFields.has(field)));
	}
});

function executionContext(parameters, response, requests) {
	return {
		continueOnFail: () => false,
		getCredentials: async () => ({
			apiKey: 'tuple_test_key',
			baseUrl: 'http://tuple.test/',
		}),
		getInputData: () => [{ json: {} }],
		getNode: () => ({
			name: 'Tuple',
			type: 'n8n-nodes-tuple.tuple',
			typeVersion: 1,
			position: [0, 0],
			parameters: {},
		}),
		getNodeParameter: (name, _itemIndex, fallback) => parameters[name] ?? fallback,
		helpers: {
			httpRequest: async (request) => {
				requests.push(request);
				return response;
			},
		},
	};
}

test('removes a client stream override without mutating additional fields', () => {
	const additionalBody = { stream: true, temperature: 0.2 };

	assert.deepEqual(withoutRouteManagedStream(additionalBody), { temperature: 0.2 });
	assert.deepEqual(additionalBody, { stream: true, temperature: 0.2 });
});

test('returns buffered JSON responses as objects', () => {
	const response = parseTupleResponse({
		body: '{"id":"chatcmpl_123","choices":[]}',
		headers: { 'content-type': 'application/json' },
		statusCode: 200,
	});

	assert.deepEqual(response, { id: 'chatcmpl_123', choices: [] });
});

test('parses chat completion event streams including the terminal marker', () => {
	const response = parseTupleResponse({
		body:
			': keepalive\r\n\r\n' +
			'id: evt_1\r\ndata: {"choices":[{"delta":{"content":"Hello"}}]}\r\n\r\n' +
			'data: [DONE]\r\n\r\n',
		headers: { 'Content-Type': 'Text/Event-Stream; Charset=UTF-8' },
		statusCode: 200,
	});

	assert.deepEqual(response, {
		responseMode: 'stream',
		events: [
			{
				event: 'message',
				id: 'evt_1',
				data: { choices: [{ delta: { content: 'Hello' } }] },
			},
			{ event: 'message', data: '[DONE]' },
		],
	});
});

test('preserves named Responses API events and multiline data', () => {
	assert.deepEqual(
		parseServerSentEvents(
			'event: response.output_text.delta\ndata: first line\ndata: second line\n\n',
		),
		{
			responseMode: 'stream',
			events: [
				{
					event: 'response.output_text.delta',
					data: 'first line\nsecond line',
				},
			],
		},
	);
});

test('preserves a non-JSON buffered response as text', () => {
	const response = parseTupleResponse({
		body: 'plain text',
		headers: { 'content-type': 'text/plain' },
		statusCode: 200,
	});

	assert.equal(response, 'plain text');
});

test('executes chat completions without overriding the route response mode', async () => {
	const requests = [];
	const context = executionContext(
		{
			operation: 'chatCompletion',
			model: 'auto',
			messages: '[{"role":"user","content":"Hello"}]',
			additionalBody: '{"stream":true,"temperature":0.2}',
		},
		{
			body: '{"choices":[]}',
			headers: { 'content-type': 'application/json' },
			statusCode: 200,
		},
		requests,
	);

	const result = await new Tuple().execute.call(context);

	assert.deepEqual(result, [[{ json: { choices: [] }, pairedItem: { item: 0 } }]]);
	assert.deepEqual(requests, [
		{
			method: 'POST',
			url: 'http://tuple.test/v1/chat/completions',
			headers: { Authorization: 'Bearer tuple_test_key' },
			encoding: 'text',
			returnFullResponse: true,
			json: true,
			body: {
				temperature: 0.2,
				model: 'auto',
				messages: [{ role: 'user', content: 'Hello' }],
			},
		},
	]);
});

test('executes Responses API calls with parsed streaming output', async () => {
	const requests = [];
	const context = executionContext(
		{
			operation: 'createResponse',
			model: 'auto',
			input: 'Hello',
			additionalBody: '{"stream":false,"max_output_tokens":20}',
		},
		{
			body:
				'event: response.output_text.delta\ndata: {"delta":"Hello"}\n\n' +
				'event: response.completed\ndata: {"response":{"status":"completed"}}\n\n',
			headers: { 'content-type': 'text/event-stream' },
			statusCode: 200,
		},
		requests,
	);

	const result = await new Tuple().execute.call(context);

	assert.deepEqual(requests[0].body, {
		max_output_tokens: 20,
		model: 'auto',
		input: 'Hello',
	});
	assert.deepEqual(result, [
		[
			{
				json: {
					responseMode: 'stream',
					events: [
						{
							event: 'response.output_text.delta',
							data: { delta: 'Hello' },
						},
						{
							event: 'response.completed',
							data: { response: { status: 'completed' } },
						},
					],
				},
				pairedItem: { item: 0 },
			},
		],
	]);
});
