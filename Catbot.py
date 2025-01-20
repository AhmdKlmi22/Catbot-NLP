from flask import Flask, render_template, request, session, redirect, url_for
from langchain.chains import LLMChain
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferMemory
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os
import re
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(level=logging.DEBUG)

# Load environment variables
load_dotenv()

# Initialize Flask application
app = Flask(__name__)
app.secret_key = "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"
app.config["SESSION_PERMANENT"] = True

# Initialize model for Q&A
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0, max_tokens=None, timeout=None)

# System prompt template
prompt = ChatPromptTemplate(
    messages=[
        SystemMessagePromptTemplate.from_template(
            "Anda adalah CatBot, asisten untuk mendiagnosis penyakit kucing yang siap membantu dengan solusi yang tepat dan efektif. "
            "Tugas Anda adalah mendiagnosis gejala-gejala yang disebutkan dengan cepat dan jelas, termasuk menyebutkan nama-nama ilmiah penyakit jika relevan. "
            "Anda menjelaskan penyebab masalah penyakit kucing dengan cara yang mudah dimengerti. "
            "Jawaban Anda harus singkat, langsung ke intinya, dan tidak memerlukan data gambar. "
            "Anda berkomunikasi dengan hangat dan memberikan jaminan untuk mendorong pengguna agar merawat kucing mereka. "
            "Anda akan mengingat detail yang disebutkan dalam percakapan kami. "
            "Disaat anda memberikan jawaban jangan pernah memberikan headline bold atau ** pada kalimat di paragraf yang anda diberikan"
            "You dikembangkan oleh Ahmad Sudrajat Dani Kalami,Rofiah Azwa Nisrina, Ghiraldy Patrick Toshka Anggawan, mahasiswa Universitas Muhammadiyah Sorong, Program Studi Teknik Informatika. "
            "Sumber data yang digunakan berasal dari seorang ahli bernama Drh Sony Hanyuwito, seorang dokter hewan bersertifikat kompetensi Dokter Hewan lulusan UGM yang berspesialisasi dalam kesehatan Kucing dan Anjing."
            "\n\n"
            
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        HumanMessagePromptTemplate.from_template("{question}")
    ]
)

# Use ConversationBufferMemory to store conversations
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

# Create LLMChain with memory
conversation_chain = LLMChain(
    llm=llm,
    prompt=prompt,
    memory=memory,
    verbose=True
)

# Time format function
def get_current_time():
    return datetime.now().strftime("%H:%M")

# Format response as a list
def format_response_as_list(text):
    if not text:
        return "<p>Answer not available.</p>"

    text = re.sub(r"(\d+)\.\s", r"<li>\1. ", text)
    if "<li>" in text:
        text = "<ul>" + text + "</ul>"
    return text

# Generate answer from input
def get_answer(question):
    try:
        result = conversation_chain.run(question=question)
        if result and result.strip():
            return f"<p>{result.strip()}</p>"
        else:
            logging.error("Received empty result from conversation_chain.")
            return "<p>Jawaban tidak tersedia.</p>"
    except Exception as e:
        error_message = f"Error: {str(e)}"
        logging.error(error_message)
        return f"<p>{error_message}</p>"

# Flask routes
@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/chat.html", methods=["GET", "POST"])
def chat():
    session.permanent = True
    if "history" not in session:
        session["history"] = []
    if request.method == "POST":
        question = request.form.get("question", "").strip()
        if question:
            logging.debug(f"Received question: {question}")
            answer = get_answer(question)
            logging.debug(f"Generated answer: {answer}")
            if answer:
                session["history"].append({"role": "user", "text": question, "time": get_current_time()})
                session["history"].append({"role": "bot", "text": answer, "time": get_current_time()})
                session.modified = True
                return {"answer": answer}
            else:
                return {"answer": "Terjadi kesalahan, silakan coba lagi nanti."}
    return render_template("chat.html", history=session["history"])

@app.route("/clear_history", methods=["POST"])
def clear_history():
    session.pop("history", None)
    memory.clear()  # Clear LangChain memory
    return redirect(url_for("chat"))

@app.before_request
def check_history_length():
    if len(session.get("history", [])) > 50:
        session.pop("history", None)
        memory.clear()  # Clear LangChain memory if history is too long

# Run the application
if __name__ == "__main__":
    app.run(debug=True)
