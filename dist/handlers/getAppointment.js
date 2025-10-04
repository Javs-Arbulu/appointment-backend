"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const main = async (event) => {
    console.log("Query params:", event.queryStringParameters);
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "List of appointments (pending implementation).",
            data: [],
        }),
    };
};
exports.main = main;
