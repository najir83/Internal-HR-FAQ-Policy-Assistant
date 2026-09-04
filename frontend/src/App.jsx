import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FileText,
  Loader2,
  Send,
  UploadCloud,
} from "lucide-react";

const API = {
  upload: "http://localhost:3000/api/document/upload",
  chat: "http://localhost:3000/api/document/chat",
};

const initialUploadState = {
  status: "idle",
  message: "",
};

function CitationBlock({ citations }) {
  const [open, setOpen] = useState(false);

  if (!citations?.length) return null;

  return (
    <div className="mt-4 border-t border-[#ECEAE4] pt-3">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
      >
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
        {open
          ? "Hide sources"
          : `Show ${citations.length} source${citations.length > 1 ? "s" : ""}`}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {citations.map((citation, index) => (
            <div
              key={index}
              className="rounded-lg border border-[#ECEAE4] bg-[#FAFAF8] px-3 py-2.5"
            >
              <p className="font-serif text-sm italic leading-6 text-gray-600">
                "{citation.quote}"
              </p>
              <p className="mt-1.5 text-xs text-gray-400">
                {citation.fileName}
                {citation.section ? ` · ${citation.section}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState(initialUploadState);

  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAsking]);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    const allowedTypes = [".md", ".txt", ".pdf"];
    const extension = `.${selectedFile.name.split(".").pop().toLowerCase()}`;

    if (!allowedTypes.includes(extension)) {
      setUploadState({
        status: "error",
        message: "Please select a .md, .txt, or .pdf file.",
      });
      return;
    }

    setFile(selectedFile);
    setUploadState(initialUploadState);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileSelect(event.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!file || uploadState.status === "uploading") return;

    setUploadState({ status: "uploading", message: "" });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(API.upload, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const data = await response.json();

      setUploadState({
        status: "success",
        message: data.message || "Document uploaded successfully.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      setUploadState({
        status: "error",
        message:
          "Unable to upload the document. Please check that the server is running.",
      });
    }
  };

  const handleAsk = async (event) => {
    event.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery || isAsking) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmedQuery,
    };

    setMessages((previous) => [...previous, userMessage]);
    setQuery("");
    setIsAsking(true);

    try {
      const response = await fetch(API.chat, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmedQuery }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed with status ${response.status}`);
      }

      const data = await response.json();

      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          answer: data.answer,
          sufficientContext: data.sufficientContext,
          citations: data.citations || [],
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          answer:
            "Something went wrong while reaching the policy assistant. Please try again.",
          sufficientContext: false,
          citations: [],
          isSystemError: true,
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const isUploading = uploadState.status === "uploading";
  const canUpload = file && !isUploading;
  const canAsk = query.trim() && !isAsking;

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#1E2333]">
      {/* Header */}
      <header className="border-b border-[#E4E2DC] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight">
              Internal HR FAQ &amp; Policy Assistant
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Ask questions about your HR policies using your uploaded documents.
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-[#E4E2DC] bg-[#FAFAF8] px-3 py-1.5 text-xs text-gray-500 sm:flex">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            AI Policy Assistant
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-xl border border-[#E4E2DC] bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Upload document
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                Make a policy document available to the assistant.
              </p>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${isDragging
                ? "border-[#2F4B7C] bg-[#F0F4FA]"
                : "border-[#D8D6CF] hover:border-[#A8A6A0] hover:bg-[#FAFAF8]"
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.txt,.pdf"
                className="hidden"
                onChange={(event) => handleFileSelect(event.target.files?.[0])}
              />

              <UploadCloud
                size={26}
                strokeWidth={1.5}
                className="mx-auto mb-2.5 text-[#2F4B7C]"
              />

              <p className="text-sm font-medium text-gray-800">
                Drop your document here
              </p>
              <p className="mt-1 text-xs text-gray-500">or click to browse</p>

              <div className="mt-3 flex justify-center gap-1.5">
                {["PDF", "MD", "TXT"].map((type) => (
                  <span
                    key={type}
                    className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* Selected file */}
            {file && (
              <div className="mt-3 flex items-start gap-3 rounded-lg border border-[#E4E2DC] bg-[#FAFAF8] p-3">
                <div className="shrink-0 rounded-md bg-[#EEF2F8] p-2">
                  <FileText size={16} strokeWidth={1.5} className="text-[#2F4B7C]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {file.name}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            )}

            {/* Upload button */}
            <button
              type="button"
              onClick={handleUpload}
              disabled={!canUpload}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#2F4B7C] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#263E67] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  Upload document
                </>
              )}
            </button>

            {uploadState.status === "success" && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-green-50 p-3 text-xs text-green-700">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                <span>{uploadState.message}</span>
              </div>
            )}

            {uploadState.status === "error" && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{uploadState.message}</span>
              </div>
            )}
          </div>
        </aside>

        {/* Chat */}
        <section className="flex min-h-[calc(100vh-180px)] flex-col">
          <div className="flex-1 space-y-5">
            {messages.length === 0 && (
              <div className="flex min-h-[50vh] items-center justify-center">
                <div className="max-w-md text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF2F8]">
                    <FileText size={24} strokeWidth={1.5} className="text-[#2F4B7C]" />
                  </div>
                  <h2 className="font-serif text-2xl font-semibold">
                    Ask about your policies
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    Upload a policy document and ask a question. Answers are
                    grounded in your uploaded documents, with sources you can
                    check.
                  </p>
                </div>
              </div>
            )}

            {messages.map((message) =>
              message.role === "user" ? (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-[#2F4B7C] px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm">
                    {message.text}
                  </div>
                </div>
              ) : (
                <div key={message.id} className="max-w-[85%]">
                  <div
                    className={`rounded-2xl rounded-bl-sm border px-5 py-4 shadow-sm ${message.sufficientContext
                      ? "border-[#E4E2DC] bg-white"
                      : "border-[#EAD9B4] bg-[#FBF6EC]"
                      }`}
                  >
                    <p
                      className={`font-serif text-[15px] leading-7 ${message.sufficientContext
                        ? "text-[#1E2333]"
                        : "text-[#8A5A00]"
                        }`}
                    >
                      {message.answer}
                    </p>

                    <CitationBlock citations={message.citations} />
                  </div>
                </div>
              )
            )}

            {isAsking && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 size={15} className="animate-spin" />
                Reading the policy...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <div className="sticky bottom-5 mt-6">
            <form
              onSubmit={handleAsk}
              className="flex items-center gap-2 rounded-xl border border-[#DCDAD4] bg-white p-2 shadow-lg shadow-black/[0.03]"
            >
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ask about a policy..."
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={!canAsk}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2F4B7C] text-white transition-colors hover:bg-[#263E67] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                {isAsking ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Send size={17} />
                )}
              </button>
            </form>
            <p className="mt-2 text-center text-[11px] text-gray-400">
              Answers are generated from uploaded policy documents.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;