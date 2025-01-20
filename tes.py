# Memuat library yang diperlukan
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.chains import create_retrieval_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.chains import LLMChain
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
import os
import pickle

# Memuat variabel lingkungan
load_dotenv()
folder_path = "source_data"  # Path folder untuk file PDF

# 1. **Langkah: Memuat dokumen PDF**
pdf_files = [f for f in os.listdir(folder_path) if f.endswith('.pdf')]
all_data = []

for pdf_file in pdf_files:
    try:
        file_path = os.path.join(folder_path, pdf_file)
        loader = PyPDFLoader(file_path)
        data = loader.load()
        all_data.extend(data)
        print(f"Berhasil memuat {len(data)} halaman dari {pdf_file}")
    except Exception as e:
        print(f"Kesalahan saat memuat PDF {pdf_file}: {e}")

if all_data:
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000)
    docs = text_splitter.split_documents(all_data)
    print(f"Jumlah total bagian dokumen: {len(docs)}")
else:
    print("Tidak ada data untuk diproses.")

# 2. **Langkah: Membuat penyimpanan vektor**
try:
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/bert-base-nli-max-tokens")
    vectorstore = Chroma.from_documents(documents=docs, embedding=embeddings, persist_directory="data")
    retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 10})
    print("Penyimpanan vektor berhasil dibuat dan disimpan.")
except Exception as e:
    print(f"Kesalahan saat menginisialisasi embeddings atau penyimpanan vektor: {e}")

# 3. **Langkah: Melatih Naïve Bayes**
# Dataset untuk melatih Naïve Bayes
questions = [
    "Feline Infectious Peritonitis dan Feline Calici Virus pada kucing?",
    "Bagaimana cara mengatasi Feline Infectious Peritonitis dan Feline Calici Virus pada kucing?",
    "Apa cara langkah penanganan pertama sebelum menjadi parah"
]
labels = ["Penyakit", "Infeksi dan Virus", "Penanganan"]

vectorizer = CountVectorizer()
X = vectorizer.fit_transform(questions)

nb_model = MultinomialNB()
nb_model.fit(X, labels)

# Simpan model dan vectorizer untuk digunakan kembali
with open("nb_model.pkl", "wb") as model_file, open("vectorizer.pkl", "wb") as vectorizer_file:
    pickle.dump(nb_model, model_file)
    pickle.dump(vectorizer, vectorizer_file)

print("Model Naïve Bayes dan vectorizer berhasil dilatih dan disimpan.")

# 4. **Langkah: Menginisialisasi RAG**
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

try:
    # Inisialisasi LLM
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0, max_tokens=None, timeout=None)

    # Prompt dengan LangChain Memory
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
            "You dikembangkan oleh Ahmad Sudrajat Dani Kalami, mahasiswa Universitas Muhammadiyah Sorong, Program Studi Teknik Informatika. "
            "Sumber data yang digunakan berasal dari seorang ahli bernama Drh Sony Hanyuwito, seorang dokter hewan bersertifikat kompetensi dokter hewan yang berspesialisasi dalam kesehatan Kucing dan Anjing."
            ),
            MessagesPlaceholder(variable_name="chat_history"),
            HumanMessagePromptTemplate.from_template("{input}")
        ]
    )

    # Chain untuk percakapan
    conversation_chain = LLMChain(
        llm=llm,
        prompt=prompt,
        verbose=True,
        memory=memory
    )
    print("RAG chain berhasil diinisialisasi.")
except Exception as e:
    print(f"Kesalahan saat menginisialisasi RAG chain: {e}")

# 5. **Langkah: Mengintegrasikan Naïve Bayes**
def classify_query(query):
    query_vectorized = vectorizer.transform([query])
    predicted_label = nb_model.predict(query_vectorized)[0]
    return predicted_label

def filter_retrieved_docs(query, retrieved_docs):
    filtered_docs = []
    for doc in retrieved_docs:
        doc_vectorized = vectorizer.transform([doc.page_content])
        predicted_label = nb_model.predict(doc_vectorized)[0]
        query_label = classify_query(query)
        if predicted_label == query_label:  # Hanya dokumen relevan yang dipertahankan
            filtered_docs.append(doc)
    return filtered_docs

# 6. **Langkah: Query dan Respons**
try:
    query = "Feline Infectious Peritonitis dan Feline Calici Virus pada kucing?"
    query_category = classify_query(query)
    print(f"Kategori pertanyaan: {query_category}")

    # Retrieve dokumen
    retrieved_docs = retriever.get_relevant_documents(query)

    # Filter dokumen dengan Naïve Bayes
    filtered_docs = filter_retrieved_docs(query, retrieved_docs)

    # Respons akhir menggunakan chain
    response = conversation_chain.invoke({"input": query})
    print("Respons:", response)
except Exception as e:
    print(f"Kesalahan saat memproses query: {e}")
