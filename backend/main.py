from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import openai
import os
from dotenv import load_dotenv
from fastapi.responses import JSONResponse

# 환경변수 로드
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# FastAPI 앱 생성
app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ai-helper-mvp.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 요청 형식 정의
class ChatRequest(BaseModel):
    user_input: str
    context: Optional[str] = None

# GPT 응답 엔드포인트
@app.post("/chat")
def chat(req: ChatRequest):
    system_prompt = """
넌 대한민국 법률 정보를 요약해서 사용자에게 제공하는 AI야.

다음 지침을 반드시 따라야 해:

1. 답변은 단도직입적이고 시원하게 말해.
- 답변은 설명체가 아닌, 요약 중심의 단문 위주 말투를 사용해. 예: “~일 가능성이 높습니다”, “~로 예상됩니다.”
2. 법률 조항과 함께 실제 판례 3건 이상을 요약해서 제공해.
3. 벌금/형량은 수치로 제시하고, 기소유예/혐의없음 같은 가능성도 %로 추정해줘.
4. 사용자의 질문이 구체적일 경우, 비슷한 판례에 근거해 해당 사건의 형량을 예측해.
   - "벌금 300~500만 원" 같은 범위보단 "벌금 약 400만 원 예상됩니다"처럼 단일 수치를 우선 제시해.
5. 소송을 지시하지 마.
6. 가능한 경우, 공연성/고의성/합의 여부 등 전략적으로 유리한 주장을 조언해줘.
7. 마지막에 아래 고지문을 반드시 붙여:

⚠️ 이 내용은 참고용이며, AI가 제공하는 일반 정보입니다. 
개별 사건에 대한 법적 판단은 변호사 상담을 통해 받으시길 바랍니다.
"""

    messages = [{"role": "system", "content": system_prompt}]

    if req.context:
        messages.append({"role": "user", "content": f"(상황 설명) {req.context}"})

    messages.append({"role": "user", "content": req.user_input.strip()})

    response = openai.chat.completions.create(
        model="gpt-4-turbo",
        messages=messages,
        temperature=0.7,
        top_p=1.0,
        presence_penalty=0,
        frequency_penalty=0
    )

    gpt_answer = response.choices[0].message.content.strip()
    return JSONResponse(content={"response": gpt_answer})
