from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
import os
import pandas as pd

load_dotenv()

data_directory = "source_data"
dataset_files = [file for file in os.listdir(data_directory) if file.endswith('.pdf')]

all_pages = []

for dataset_file in dataset_files:
    try:
        file_path = os.path.join(data_directory, dataset_file)
        pdf_loader = PyPDFLoader(file_path)
        document_data = pdf_loader.load()
        all_pages.extend(document_data)
        print(f"Sukses memuat {len(document_data)} halaman dari {dataset_file}")
    except Exception as error:
        print(f"Terjadi kesalahan saat memuat file PDF {dataset_file}: {error}")

if all_pages:
    document_splitter = RecursiveCharacterTextSplitter(chunk_size=1000)
    split_documents = document_splitter.split_documents(all_pages)
    print(f"Total bagian dokumen yang dihasilkan: {len(split_documents)}")
else:
    print("Tidak ada data yang ditemukan untuk diproses.")

embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/bert-base-nli-max-tokens")

vector_storage = Chroma.from_documents(
    documents=split_documents,
    embedding=embedding_model,
    persist_directory="hasil_data_latih"
)

retrieval_tool = vector_storage.as_retriever(search_type="similarity", search_kwargs={"k": 10})
print("Vector storage berhasil dibuat dan disimpan.")

language_model = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0, max_tokens=None, timeout=None)

system_instructions = (
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
    "{context}"
)

chat_prompt_template = ChatPromptTemplate.from_messages(
    [
        ("system", system_instructions),
        ("human", "{input}"),
    ]
)

qa_chain = create_stuff_documents_chain(language_model, chat_prompt_template)
retrieval_chain = create_retrieval_chain(retrieval_tool, qa_chain)

# Sample query
sample_query = "kucing saya sulit bernafas dan terdapat lendir pada hidungnya, apa penyebab dan bagaimana cara mengatasinya? selain lendir pada hidung juga kucing saya mengalami buncit cairan yang menutupi perut kucing"
final_response = retrieval_chain.invoke({"input": sample_query})
print("Jawaban yang diberikan:", final_response["answer"])

retrieved_documents = retrieval_tool.invoke(sample_query)

query_embedding = embedding_model.embed_query(sample_query)

similarities = []
dataset_vectors = []
for doc in retrieved_documents:
    doc_embedding = embedding_model.embed_query(doc.page_content)
    dataset_vectors.append(doc_embedding)
    
    similarity = cosine_similarity([query_embedding], [doc_embedding])[0][0]
    similarities.append(similarity)

similarities = sorted(similarities, key=lambda x: x, reverse=True)

# Display only the similarity scores
print("Skor similarity:")
for score in similarities:
    print(f"{score:.4f}")

# Prepare data for Excel
columns = ['Subjudul', 'Vector Dataset'] + [f'Vector Embeddings {i+1}' for i in range(len(similarities))]
rows = []

# Assume you are working with a fixed number of dimensions, e.g., 768 for BERT-based embeddings
embedding_dim = len(query_embedding)

for dim in range(embedding_dim):
    row = [f'Dimensi {dim+1}']
    row.append(query_embedding[dim])  # Vector Hasil Embedding untuk query
    
    # Append the corresponding vectors from retrieved documents
    for doc_vector in dataset_vectors:
        row.append(doc_vector[dim])
    
    rows.append(row)

# Create DataFrame
df = pd.DataFrame(rows, columns=columns)

# Write DataFrame to Excel
output_file = "embedding_manual_laporan.xlsx"
df.to_excel(output_file, index=False)

print(f"File Excel disimpan di {output_file}")
