import os

from app.models.product import ProductCategory


async def suggest_category(product_name: str) -> dict:
    try:
        import anthropic

        api_key = os.environ.get("ANTHROPIC_API_KEY", "")
        if not api_key:
            return _fallback_suggest(product_name)

        client = anthropic.Anthropic(api_key=api_key)
        categories = ", ".join(c.value for c in ProductCategory)
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=64,
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"Classify this product into exactly one of these categories: {categories}.\n"
                        f"Product name: {product_name}\n"
                        f"Reply with just the category name and a confidence score 0.0-1.0, "
                        f"separated by a comma. Example: electronics,0.95"
                    ),
                }
            ],
        )
        text = message.content[0].text.strip().lower()
        parts = text.split(",")
        if len(parts) >= 2:
            category = parts[0].strip()
            try:
                confidence = float(parts[1].strip())
            except ValueError:
                confidence = 0.8
            if category in [c.value for c in ProductCategory]:
                return {"category": category, "confidence": round(confidence, 2)}
        return _fallback_suggest(product_name)
    except Exception:
        return _fallback_suggest(product_name)


def _fallback_suggest(product_name: str) -> dict:
    name_lower = product_name.lower()
    if any(w in name_lower for w in ["phone", "laptop", "computer", "tablet", "camera", "tv", "monitor", "keyboard"]):
        return {"category": ProductCategory.electronics.value, "confidence": 0.7}
    if any(w in name_lower for w in ["chair", "table", "desk", "shelf", "sofa", "cabinet", "bed"]):
        return {"category": ProductCategory.furniture.value, "confidence": 0.7}
    if any(w in name_lower for w in ["shirt", "pants", "shoes", "dress", "jacket", "hat", "socks"]):
        return {"category": ProductCategory.clothing.value, "confidence": 0.7}
    if any(w in name_lower for w in ["food", "drink", "snack", "juice", "coffee", "tea", "sugar", "flour"]):
        return {"category": ProductCategory.food.value, "confidence": 0.7}
    if any(w in name_lower for w in ["steel", "aluminum", "wood", "plastic", "metal", "rubber", "copper"]):
        return {"category": ProductCategory.raw_materials.value, "confidence": 0.7}
    return {"category": ProductCategory.other.value, "confidence": 0.5}
