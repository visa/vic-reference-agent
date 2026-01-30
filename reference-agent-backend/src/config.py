# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import os
import sys
from pydantic_settings import BaseSettings, SettingsConfigDict

env_file = f".env"
if not os.path.exists(env_file):
    raise FileNotFoundError(f"Environment file {env_file} does not exist. Please create it.")

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Uses Pydantic Settings for type validation and IDE support.
    """
    # LLM settings
    llm_provider: str
    llm_api_key: str
    llm_model: str
    llm_base_url: str

    # Visa Developer Platform (VDP) settings
    vts_base_url: str
    vts_api_key: str
    vts_shared_secret: str
    vic_base_url: str
    vic_api_key: str
    vic_shared_secret: str
    tr_id: str
    tr_client_id: str
    tr_app_id: str
    tr_enc_api_key: str
    tr_enc_shared_secret: str
    mle_enc_cert: str
    mle_key_id: str
    mle_dec_key: str

    # Merchant MCP URL
    merchant_mcp_url: str = "http://localhost:8002/mcp"

    model_config = SettingsConfigDict(
        env_file=env_file,
        env_ignore_empty=True,
        extra="ignore"
    )

try:
    settings = Settings() # type: ignore
except Exception as e:
    print(f"Configuration Error: {e}")
    sys.exit(1)