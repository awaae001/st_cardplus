export type ChatCompletionSource =
    | 'openai'
    | 'claude'
    | 'openrouter'
    | 'ai21'
    | 'makersuite'
    | 'vertexai'
    | 'mistralai'
    | 'custom'
    | 'cohere'
    | 'perplexity'
    | 'groq'
    | 'electronhub'
    | 'chutes'
    | 'nanogpt'
    | 'deepseek'
    | 'aimlapi'
    | 'xai'
    | 'pollinations'
    | 'moonshot'
    | 'fireworks'
    | 'cometapi'
    | 'azure_openai'
    | 'zai'
    | 'siliconflow';

export type CharacterNamesBehavior = -1 | 0 | 1 | 2;
export type ContinuePostfix = '' | ' ' | '\n' | '\n\n';
export type CustomPromptPostProcessing =
    | ''
    | 'claude'
    | 'merge'
    | 'merge_tools'
    | 'semi'
    | 'semi_tools'
    | 'strict'
    | 'strict_tools'
    | 'single';
export type OpenRouterMiddleout = 'auto' | 'on' | 'off';
export type ReasoningEffort = 'auto' | 'low' | 'medium' | 'high' | 'min' | 'max';
export type VerbosityLevel = 'auto' | 'low' | 'medium' | 'high';
export type ZaiEndpoint = 'common' | 'coding';
export type VertexAIAuthMode = 'express' | 'full';

export interface PromptDefinition {
    identifier: string;
    name?: string;
    system_prompt?: boolean;
    role?: string;
    content?: string;
    marker?: boolean;
}

export interface PromptOrderItem {
    identifier: string;
    enabled: boolean;
}

export interface OpenAIChatCompletionPreset {
    chat_completion_source: ChatCompletionSource;
    temperature: number;
    frequency_penalty: number;
    presence_penalty: number;
    top_p: number;
    top_k: number;
    top_a: number;
    min_p: number;
    repetition_penalty: number;
    max_context_unlocked: boolean;
    openai_model: string;
    claude_model: string;
    openrouter_model: string;
    openrouter_use_fallback: boolean;
    openrouter_group_models: boolean;
    openrouter_sort_models: string;
    openrouter_providers: string[];
    openrouter_allow_fallbacks: boolean;
    openrouter_middleout: OpenRouterMiddleout;
    ai21_model: string;
    mistralai_model: string;
    cohere_model: string;
    perplexity_model: string;
    groq_model: string;
    chutes_model: string;
    chutes_sort_models: string;
    siliconflow_model: string;
    electronhub_model: string;
    electronhub_sort_models: string;
    electronhub_group_models: boolean;
    nanogpt_model: string;
    deepseek_model: string;
    aimlapi_model: string;
    xai_model: string;
    pollinations_model: string;
    moonshot_model: string;
    fireworks_model: string;
    cometapi_model: string;
    custom_model: string;
    custom_url: string;
    custom_include_body: string;
    custom_exclude_body: string;
    custom_include_headers: string;
    custom_prompt_post_processing: CustomPromptPostProcessing;
    google_model: string;
    vertexai_model: string;
    zai_model: string;
    zai_endpoint: ZaiEndpoint;
    openai_max_context: number;
    openai_max_tokens: number;
    names_behavior: CharacterNamesBehavior;
    send_if_empty: string;
    impersonation_prompt: string;
    new_chat_prompt: string;
    new_group_chat_prompt: string;
    new_example_chat_prompt: string;
    continue_nudge_prompt: string;
    bias_preset_selected: string;
    reverse_proxy: string;
    wi_format: string;
    scenario_format: string;
    personality_format: string;
    group_nudge_prompt: string;
    stream_openai: boolean;
    prompts: PromptDefinition[];
    prompt_order: PromptOrderItem[];
    show_external_models: boolean;
    proxy_password: string;
    assistant_prefill: string;
    assistant_impersonation: string;
    use_sysprompt: boolean;
    vertexai_auth_mode: VertexAIAuthMode;
    vertexai_region: string;
    vertexai_express_project_id: string;
    squash_system_messages: boolean;
    media_inlining: boolean;
    inline_image_quality: string;
    continue_prefill: boolean;
    continue_postfix: ContinuePostfix;
    function_calling: boolean;
    show_thoughts: boolean;
    reasoning_effort: ReasoningEffort;
    verbosity: VerbosityLevel;
    enable_web_search: boolean;
    seed: number;
    n: number;
    bypass_status_check: boolean;
    request_images: boolean;
    request_image_aspect_ratio: string;
    request_image_resolution: string;
    azure_base_url: string;
    azure_deployment_name: string;
    azure_api_version: string;
    azure_openai_model: string;
    extensions: Record<string, unknown>;
}

export const defaultOpenAIPreset: OpenAIChatCompletionPreset = {
    chat_completion_source: 'openai',
    temperature: 1.0,
    frequency_penalty: 0,
    presence_penalty: 0,
    top_p: 1.0,
    top_k: 0,
    top_a: 0,
    min_p: 0,
    repetition_penalty: 1,
    max_context_unlocked: false,
    openai_model: 'gpt-4-turbo',
    claude_model: 'claude-sonnet-4-5',
    openrouter_model: 'OR_Website',
    openrouter_use_fallback: false,
    openrouter_group_models: false,
    openrouter_sort_models: 'alphabetically',
    openrouter_providers: [],
    openrouter_allow_fallbacks: true,
    openrouter_middleout: 'on',
    ai21_model: 'jamba-large',
    mistralai_model: 'mistral-large-latest',
    cohere_model: 'command-r-plus',
    perplexity_model: 'sonar-pro',
    groq_model: 'llama-3.3-70b-versatile',
    chutes_model: 'deepseek-ai/DeepSeek-V3-0324',
    chutes_sort_models: 'alphabetically',
    siliconflow_model: 'deepseek-ai/DeepSeek-V3',
    electronhub_model: 'gpt-4o-mini',
    electronhub_sort_models: 'alphabetically',
    electronhub_group_models: false,
    nanogpt_model: 'gpt-4o-mini',
    deepseek_model: 'deepseek-chat',
    aimlapi_model: 'chatgpt-4o-latest',
    xai_model: 'grok-3-beta',
    pollinations_model: 'openai',
    moonshot_model: 'kimi-latest',
    fireworks_model: 'accounts/fireworks/models/kimi-k2-instruct',
    cometapi_model: 'gpt-4o',
    custom_model: '',
    custom_url: '',
    custom_include_body: '',
    custom_exclude_body: '',
    custom_include_headers: '',
    custom_prompt_post_processing: '',
    google_model: 'gemini-2.5-pro',
    vertexai_model: 'gemini-2.5-pro',
    zai_model: 'glm-4.6',
    zai_endpoint: 'common',
    openai_max_context: 4095,
    openai_max_tokens: 300,
    names_behavior: 0,
    send_if_empty: '',
    impersonation_prompt: '[Write your next reply from the point of view of {{user}}, using the chat history so far as a guideline for the writing style of {{user}}. Don\'t write as {{char}} or system. Don\'t describe actions of {{char}}.]',
    new_chat_prompt: '[Start a new Chat]',
    new_group_chat_prompt: '[Start a new group chat. Group members: {{group}}]',
    new_example_chat_prompt: '[Example Chat]',
    continue_nudge_prompt: '[Continue your last message without repeating its original content.]',
    bias_preset_selected: 'Default (none)',
    reverse_proxy: '',
    wi_format: '{0}',
    scenario_format: '{{scenario}}',
    personality_format: '{{personality}}',
    group_nudge_prompt: '[Write the next reply only as {{char}}.]',
    stream_openai: false,
    prompts: [
        {
            name: 'Main Prompt',
            system_prompt: true,
            role: 'system',
            content: 'Write {{char}}\'s next reply in a fictional chat between {{charIfNotGroup}} and {{user}}.',
            identifier: 'main',
        },
        {
            name: 'Auxiliary Prompt',
            system_prompt: true,
            role: 'system',
            content: '',
            identifier: 'nsfw',
        },
        {
            identifier: 'dialogueExamples',
            name: 'Chat Examples',
            system_prompt: true,
            marker: true,
        },
        {
            name: 'Post-History Instructions',
            system_prompt: true,
            role: 'system',
            content: '',
            identifier: 'jailbreak',
        },
        {
            identifier: 'chatHistory',
            name: 'Chat History',
            system_prompt: true,
            marker: true,
        },
        {
            identifier: 'worldInfoAfter',
            name: 'World Info (after)',
            system_prompt: true,
            marker: true,
        },
        {
            identifier: 'worldInfoBefore',
            name: 'World Info (before)',
            system_prompt: true,
            marker: true,
        },
        {
            identifier: 'enhanceDefinitions',
            role: 'system',
            name: 'Enhance Definitions',
            content: 'If you have more knowledge of {{char}}, add to the character\'s lore and personality to enhance them but keep the Character Sheet\'s definitions absolute.',
            system_prompt: true,
            marker: false,
        },
        {
            identifier: 'charDescription',
            name: 'Char Description',
            system_prompt: true,
            marker: true,
        },
        {
            identifier: 'charPersonality',
            name: 'Char Personality',
            system_prompt: true,
            marker: true,
        },
        {
            identifier: 'scenario',
            name: 'Scenario',
            system_prompt: true,
            marker: true,
        },
        {
            identifier: 'personaDescription',
            name: 'Persona Description',
            system_prompt: true,
            marker: true,
        },
    ],
    prompt_order: [],
    show_external_models: false,
    proxy_password: '',
    assistant_prefill: '',
    assistant_impersonation: '',
    use_sysprompt: false,
    vertexai_auth_mode: 'express',
    vertexai_region: 'us-central1',
    vertexai_express_project_id: '',
    squash_system_messages: false,
    media_inlining: true,
    inline_image_quality: 'auto',
    continue_prefill: false,
    continue_postfix: ' ',
    function_calling: false,
    show_thoughts: true,
    reasoning_effort: 'auto',
    verbosity: 'auto',
    enable_web_search: false,
    seed: -1,
    n: 1,
    bypass_status_check: false,
    request_images: false,
    request_image_aspect_ratio: '',
    request_image_resolution: '',
    azure_base_url: '',
    azure_deployment_name: '',
    azure_api_version: '2024-02-15-preview',
    azure_openai_model: '',
    extensions: {},
};
