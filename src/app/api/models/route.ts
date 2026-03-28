import { NextResponse } from "next/server";
import { AVAILABLE_MODELS } from "@/types";

export async function GET() {
    return NextResponse.json({
        models: AVAILABLE_MODELS,
        defaultCloud: "gpt-oss:120b",
        defaultLocal: "qwen3.5:latest",
        // defaultLocal: "llama3.2:3b",
    });
}