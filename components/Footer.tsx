export default function Footer() {
  return (
    <footer className="py-6">
      <p className="max-w-[960px] mx-auto text-[color:var(--color-text-muted)] text-sm text-center px-6">
        &copy; {new Date().getFullYear()} Saan Tayo Next? &#x2022; made by Gelo Rosel
      </p>
    </footer>
  );
}
