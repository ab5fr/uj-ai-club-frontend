import Link from "next/link";

export default function UojFooter({ contactHref = "/#contact" }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link href="/" className="logo">
              <img src="/mainlogo.png" className="logo__mark" alt="AI Club" />
              <div className="logo__text">
                Artificial Intelligence<small>Club</small>
              </div>
            </Link>
            <p>
              A student-led AI community focused on learning machine learning,
              deep learning, and AI together.
            </p>
          </div>
          <div className="footer__col">
            <h5>Pages</h5>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/challanges">Challenges</Link>
              </li>
              <li>
                <Link href="/roadmap">Roadmap</Link>
              </li>
            </ul>
          </div>
          <div className="footer__col">
            <h5>Community</h5>
            <ul>
              <li>
                <a href="#">Discord</a>
              </li>
              <li>
                <a href="#">GitHub</a>
              </li>
              <li>
                <a href="#">Newsletter</a>
              </li>
            </ul>
          </div>
          <div className="footer__col">
            <h5>Account</h5>
            <ul>
              <li>
                <Link href="/login">Sign In</Link>
              </li>
              <li>
                <Link href="/signup">Create Account</Link>
              </li>
              <li>
                <Link href={contactHref}>Contact Us</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© 2026 Artificial Intelligence Club. All rights reserved.</span>
          <span>Build the Future.</span>
        </div>
      </div>
    </footer>
  );
}
