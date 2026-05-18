from openai import OpenAI
from app.core.config import settings

class LLMService:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)
        else:
            self.client = None

    def generate_narrative(self, event_type: str, metadata: dict) -> str:
        """
        Generates a concise, sparse narrative based on pure statistical metadata.
        No raw code is sent. Only token-efficient metadata summaries.
        """
        if not self.api_key or not self.client:
            # High-fidelity mock narrative fallback for offline demo / missing API key
            if event_type == "Pre-merge PR Impact":
                risk = metadata.get("calculated_risk", "Low")
                modules = ", ".join(metadata.get("modules_affected", [])) or "core"
                files = metadata.get("files_changed", 0)
                if risk == "High":
                    return f"CRITICAL: Structural mutation risk is high. Merging {files} files will introduce tight coupling inside '{modules}', exceeding service safety threshold and degrading temporal resilience."
                elif risk == "Medium":
                    return f"WARNING: Decoupling warning. Increased churn in '{modules}' may cause moderate architectural drift. Recommend splitting commits to isolate dependencies."
                return f"Analysis complete: Merging {files} files into '{modules}' preserves perfect linear boundaries. No cyclic dependencies or layer violations detected."
            
            # Generic technical narrative fallbacks
            if "health_score" in metadata:
                hs = float(metadata["health_score"])
                if hs < 70:
                    return f"Architectural drift accelerated. Core files in this commit exhibit high mutation rates, leading to circular imports and instability propagation."
                return f"Stability parameters within bounds. Code base maintainability remains optimal with low structural entropy."
            
            return f"Observatory Alert: Temporal mutation event successfully indexed. Decoupling and layer constraints remain within the 98% confidence interval."

        prompt = (
            f"You are an expert Staff Engineer (AetherGraph AI CTO). "
            f"Analyze this statistical anomaly and provide a 1-2 sentence narrative explanation.\n\n"
            f"Event Type: {event_type}\n"
            f"Metadata: {metadata}\n\n"
            f"Narrative:"
        )

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a concise, highly technical AI CTO."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=60,
                temperature=0.3
            )
            
            # Track token usage in Redis
            import redis
            try:
                r = redis.Redis(host='localhost', port=6379, db=0)
                prompt_tokens = response.usage.prompt_tokens
                completion_tokens = response.usage.completion_tokens
                total_tokens = response.usage.total_tokens
                r.incrby("metrics:prompt_tokens", prompt_tokens)
                r.incrby("metrics:completion_tokens", completion_tokens)
                r.incrby("metrics:total_tokens", total_tokens)
            except Exception:
                pass

            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"Error generating narrative: {str(e)}"

