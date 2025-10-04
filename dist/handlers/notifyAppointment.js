"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const main = async (event) => {
    console.log("SQS Event:", JSON.stringify(event, null, 2));
    for (const record of event.Records) {
        const body = JSON.parse(record.body);
        console.log("Processing notification:", body);
    }
    return;
};
exports.main = main;
