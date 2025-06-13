from elevenlabs import ElevenLabs, VoiceSettings, stream
from dotenv import load_dotenv
import os

# .env에서 API 키 불러오기
load_dotenv()
api_key = os.getenv("ELEVEN_API_KEY")

# ElevenLabs 클라이언트 생성
client = ElevenLabs(api_key=api_key)

# 음성 출력 함수
def speak(text):
    audio = client.generate(
        text=text,
        voice="uyVNoMrnUku1dZyVEXwD",  # Anna Kim
        model="eleven_multilingual_v2",
        voice_settings=VoiceSettings(
            stability=0.5,
            similarity_boost=0.9
        )
    )
    stream(audio)

# 테스트 실행
if __name__ == "__main__":
    speak("좋아요! 같이 해보자요. 종이컵으로 물 3컵을 냄비에 부어요.")
