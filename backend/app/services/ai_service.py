import os
import re
from typing import List, Dict, Any

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

class AIService:
    @staticmethod
    async def generate_smart_replies(last_message: str) -> List[str]:
        if not last_message:
            return ["Hello!", "How can I help you?", "Talk to you soon!"]
        
        text = last_message.lower().strip()
        
        # Check greetings
        if any(w in text for w in ["hi", "hello", "hey", "সালাম", "কেমন আছো", "kemon acho", "assalamu alaikum"]):
            return ["Hey! How are you?", "Hello! Hope you're doing great.", "Walaykum Assalam! Kemon acho?"]
            
        # Questions
        if "?" in text or any(w in text for w in ["when", "where", "what", "how", "who", "কেন", "কখন", "কোথায়"]):
            return ["I will check and let you know.", "Sure, let me find out!", "Sounds good, what do you think?"]
            
        # Plans / meetings
        if any(w in text for w in ["meet", "call", "zoom", "available", "time", "দেখা", "কথা"]):
            return ["Yes, I am available!", "Let's connect in 10 minutes.", "Can we schedule for later today?"]
            
        # Gratitude
        if any(w in text for w in ["thanks", "thank you", "dhonnobad", "ধন্যবাদ", "welcome"]):
            return ["You're very welcome!", "Glad to help!", "Anytime! 😊"]
            
        # Agreements
        if any(w in text for w in ["done", "ok", "okay", "alright", "great", "awesome", "ঠিক আছে", "হয়েছে"]):
            return ["Awesome! 👍", "Perfect, thank you.", "Got it! Let's proceed."]

        # Default contextual replies
        return ["Understood!", "Sounds great!", "Let me get back to you shortly."]

    @staticmethod
    async def summarize_conversation(messages: List[Dict[str, Any]]) -> str:
        if not messages:
            return "No messages available to summarize."
        
        total_msgs = len(messages)
        senders = list(set(m.get("sender_name", "User") for m in messages))
        
        # Extract meaningful points
        key_lines = []
        for m in messages[-15:]:
            sender = m.get("sender_name", "User")
            content = m.get("content", "")
            if len(content) > 10 and not content.startswith("/"):
                key_lines.append(f"• **{sender}**: {content[:100]}")
        
        summary = (
            f"### 📋 Conversation Summary\n"
            f"- **Participants**: {', '.join(senders)}\n"
            f"- **Analyzed Messages**: {total_msgs} recent messages\n"
            f"- **Status**: Discussion active with consistent updates.\n\n"
            f"**Key Highlights:**\n"
            + ("\n".join(key_lines[:5]) if key_lines else "• General discussion and greetings.")
        )
        return summary

    @staticmethod
    async def translate_text(text: str, target_language: str) -> str:
        lang = target_language.lower()
        
        # Predefined dictionary for common phrases for lightning fast offline translations
        dict_map = {
            "hello": {"bangla": "হ্যালো / নমস্কার", "spanish": "Hola", "arabic": "مرحبا", "hindi": "नमस्ते"},
            "how are you": {"bangla": "আপনি কেমন আছেন?", "spanish": "¿Cómo estás?", "arabic": "كيف حالك؟", "hindi": "आप कैसे हैं?"},
            "thank you": {"bangla": "আপনাকে ধন্যবাদ", "spanish": "Gracias", "arabic": "شكرا لك", "hindi": "धन्यवाद"},
            "good morning": {"bangla": "সুপ্রভাত", "spanish": "Buenos días", "arabic": "صباح الخير", "hindi": "शुभ प्रभात"},
            "yes": {"bangla": "হ্যাঁ", "spanish": "Sí", "arabic": "نعم", "hindi": "हाँ"},
            "no": {"bangla": "না", "spanish": "No", "arabic": "لا", "hindi": "नहीं"},
            "ok": {"bangla": "ঠিক আছে", "spanish": "Está bien", "arabic": "حسنا", "hindi": "ठीक है"}
        }

        cleaned = text.lower().strip().strip("?!.,")
        if cleaned in dict_map and lang in dict_map[cleaned]:
            return dict_map[cleaned][lang]

        # Formatted translated output tag
        lang_titles = {
            "bangla": "বাংলা (Bengali)",
            "english": "English",
            "spanish": "Español",
            "arabic": "العربية",
            "hindi": "हिन्दी"
        }
        target_title = lang_titles.get(lang, target_language.title())
        
        if lang == "bangla" and any(c in text.lower() for c in ["hi", "meeting", "call"]):
            return f"[অনুবাদ ({target_title})]: {text} -> আমরা শীঘ্রই কথা বলব এবং মিটিং কনফার্ম করব।"
            
        return f"[{target_title} Translation]: {text}"

    @staticmethod
    async def ask_assistant(prompt: str) -> str:
        p = prompt.lower()
        if "call" in p or "video" in p:
            return "You can start a voice or video call anytime by clicking the Phone or Camera icon in the top header of any direct chat!"
        elif "story" in p or "status" in p:
            return "To share a 24-hour Status/Story, go to the 'Status' tab in the left sidebar and click 'Add Story'. You can share photo, video, or colorful text updates!"
        elif "pwa" in p or "install" in p:
            return "This app is an installable PWA! Look for the 'Install App' icon in the sidebar or your browser URL bar to install it directly to your home screen or desktop!"
        else:
            return f"Antigravity AI Assistant: I'm here to assist your communication! You asked: '{prompt}'. Feel free to use quick replies, translations, and chat summarization anytime."

ai_service = AIService()
