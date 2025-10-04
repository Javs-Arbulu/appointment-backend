"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const main = async (event) => {
    console.log("Incoming request:", event.body);
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Appointment request received (pending implementation).",
        }),
    };
};
exports.main = main;
