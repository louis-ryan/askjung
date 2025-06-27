import '@testing-library/jest-dom';
import { render, screen, fireEvent } from "@testing-library/react";
import BookRecommendationModal, { Book } from "../BookRecommendationModal";

const sampleBook: Book = {
  title: "Test Book",
  author: "Test Author",
  link: "https://example.com/book",
  image: "https://example.com/book.jpg"
};

describe("BookRecommendationModal", () => {
  it("renders the modal with book info when open and book are provided", () => {
    render(
      <BookRecommendationModal
        open={true}
        book={sampleBook}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByText(sampleBook.title)).toBeInTheDocument();
    expect(screen.getByText(`by ${sampleBook.author}`)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: sampleBook.title })).toHaveAttribute("src", sampleBook.image);
    const cta = screen.getByRole("link", { name: /listen or get the book/i });
    expect(cta).toHaveAttribute("href", sampleBook.link);
  });

  it("does not render when open is false", () => {
    render(
      <BookRecommendationModal
        open={false}
        book={sampleBook}
        onClose={jest.fn()}
      />
    );
    expect(screen.queryByText(sampleBook.title)).not.toBeInTheDocument();
  });

  it("does not render when book is null", () => {
    render(
      <BookRecommendationModal
        open={true}
        book={null}
        onClose={jest.fn()}
      />
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = jest.fn();
    render(
      <BookRecommendationModal
        open={true}
        book={sampleBook}
        onClose={onClose}
      />
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalled();
  });
}); 