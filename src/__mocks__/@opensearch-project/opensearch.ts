import { jest } from "@jest/globals";

const mockOpenSearch = {
    indices: {
        exists: jest.fn(() => Promise.resolve({ body: false })),
        create: jest.fn(() => Promise.resolve({ body: {} })),
    },
    index: jest.fn(() => Promise.resolve({ body: {} })),
    search: jest.fn(() =>
        Promise.resolve({
            body: {
                hits: {
                    hits: [],
                },
            },
        })
    ),
    cluster: {
        health: jest.fn(() =>
            Promise.resolve({
                body: {
                    status: "green",
                    cluster_name: "test-cluster",
                },
            })
        ),
    },
};

module.exports = {
    Client: jest.fn(() => mockOpenSearch),
};

export class Client {
    constructor() {
        return mockClient;
    }
}
