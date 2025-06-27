import React from "react";
import { booksList } from "../booksList";

export type Book = typeof booksList[0];

interface BookRecommendationModalProps {
  open: boolean;
  book: Book | null;
  onClose: () => void;
}

const BookRecommendationModal: React.FC<BookRecommendationModalProps> = ({ open, book, onClose }) => {
  if (!open || !book) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.6)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "20px",
        padding: "36px 28px 28px 28px",
        maxWidth: "95vw",
        width: "370px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
        textAlign: "center",
        position: "relative",
        border: "1px solid #ececec"
      }}>
        <button onClick={onClose} style={{
          position: "absolute",
          top: 16,
          right: 20,
          background: "#f5f5f5",
          border: "none",
          borderRadius: "50%",
          width: 36,
          height: 36,
          fontSize: 22,
          cursor: "pointer",
          color: "#888",
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
          transition: "background 0.2s"
        }} aria-label="Close">×</button>
        <img src={book.image} alt={book.title} style={{
          width: "120px",
          height: "auto",
          borderRadius: "10px",
          marginBottom: "18px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.10)"
        }} />
        <h2 style={{ margin: "10px 0 4px 0", fontSize: "1.35em", fontWeight: 700, color: "#222" }}>{book.title}</h2>
        <p style={{ color: "#666", marginBottom: "18px", fontSize: "1.05em" }}>by {book.author}</p>
        <hr style={{ border: 0, borderTop: "1px solid #eee", margin: "18px 0 18px 0" }} />
        <div style={{ marginBottom: 18 }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#364f6b", fontWeight: 600, fontSize: "1.08em" }}>Already have Audible?</h4>
          <a href={book.link} target="_blank" rel="noopener noreferrer" style={{
            display: "inline-block",
            background: "#ff9900",
            color: "#fff",
            fontWeight: 600,
            padding: "13px 28px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "1.08em",
            marginBottom: "6px",
            boxShadow: "0 1px 6px rgba(255,153,0,0.08)",
            transition: "background 0.2s"
          }}>
            Get the Book
          </a>
        </div>
        <div style={{ marginBottom: 8 }}>
          <h4 style={{ margin: "18px 0 10px 0", color: "#364f6b", fontWeight: 600, fontSize: "1.08em" }}>New to Audible?</h4>
          <a href="https://amzn.to/44BLg1J" target="_blank" rel="noopener noreferrer" style={{
            display: "inline-block",
            background: "#364f6b",
            color: "#fff",
            fontWeight: 600,
            padding: "13px 28px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "1.08em",
            marginBottom: "4px",
            boxShadow: "0 1px 6px rgba(54,79,107,0.08)",
            transition: "background 0.2s"
          }}>
            Try Audible Free
          </a>
        </div>
        <p style={{ fontSize: "0.97em", color: "#aaa", marginTop: "16px" }}>
          (Affiliate links)
        </p>
      </div>
    </div>
  );
};

export default BookRecommendationModal; 