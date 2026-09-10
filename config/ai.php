<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Jawebni AI Engine
    |--------------------------------------------------------------------------
    |
    | Central configuration for the multi-provider AI engine (OpenAI, Claude,
    | Gemini), the embedding strategy used by the RAG pipeline and the default
    | generation parameters used when answering Moroccan customers on WhatsApp.
    |
    */

    'default_provider' => env('AI_PROVIDER', 'openai'),

    'fallback_provider' => env('AI_FALLBACK_PROVIDER', 'gemini'),

    'embedding_provider' => env('AI_EMBEDDING_PROVIDER', 'openai'),

    'embedding_model' => env('AI_EMBEDDING_MODEL', 'text-embedding-3-small'),

    'embedding_dimensions' => (int) env('AI_EMBEDDING_DIMENSIONS', 1536),

    // Dimensions of the offline hashing vectoriser used when no embedding
    // provider is configured (keeps semantic search working without API keys).
    'local_embedding_dimensions' => (int) env('AI_LOCAL_EMBEDDING_DIMENSIONS', 512),

    'timeout' => (int) env('AI_HTTP_TIMEOUT', 30),

    'temperature' => (float) env('AI_TEMPERATURE', 0.4),

    'max_tokens' => (int) env('AI_MAX_TOKENS', 700),

    'models' => [
        'openai' => env('OPENAI_MODEL', 'gpt-4o-mini'),
        'claude' => env('ANTHROPIC_MODEL', 'claude-3-5-sonnet-latest'),
        'gemini' => env('GEMINI_MODEL', 'gemini-2.0-flash'),
    ],

    'rag' => [
        'top_k' => (int) env('RAG_TOP_K', 4),
        'min_score' => (float) env('RAG_MIN_SCORE', 0.10),
        'chunk_words' => (int) env('RAG_CHUNK_WORDS', 150),
        'chunk_overlap' => (int) env('RAG_CHUNK_OVERLAP', 30),
    ],

];
