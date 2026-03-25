import "./Card.css";
import { Linkedin, Facebook, EnvelopeFill } from 'react-bootstrap-icons'

function Card({ imageUrl, name, position, facebookLink, email, linkedinLink, data }) {
  // Helper function to check if a social link is valid (not empty, not "#", not null/undefined)
  const isValidLink = (link) => {
    return link && link.trim() !="" && link !== "#";
  };

  const hasFacebook = isValidLink(facebookLink);
  const hasEmail = isValidLink(email);
  const hasLinkedin = isValidLink(linkedinLink);

  // Check if any social links are available
  const hasAnySocials = hasFacebook || hasEmail || hasLinkedin;

  return (
    <>
      <div className="members_card">
        <div className="members_card_image">
          <img src={imageUrl} alt="member" srcset="" />
        </div>
        <div className="members_card_info">
          <h3 className="members_name">{name}</h3>
          <p className="members_designation">{position}</p>
          
          {/* Only render social links section if at least one social is available */}
          {hasAnySocials && (
            <div className="members_social_links">
              <a
                href={hasFacebook ? facebookLink : "#"}
                className={!hasFacebook ? "social-unavailable" : ""}
                target="_blank"
                rel="noreferrer"
                onClick={!hasFacebook ? (e) => e.preventDefault() : undefined}
              >
                <Facebook />
              </a>
              <a
                href={hasEmail ? `mailto:${email}` : "#"}
                className={!hasEmail ? "social-unavailable" : ""}
                target="_blank"
                rel="noreferrer"
                onClick={!hasEmail ? (e) => e.preventDefault() : undefined}
              >
                <EnvelopeFill />
              </a>
              <a
                href={hasLinkedin ? linkedinLink : "#"}
                className={!hasLinkedin ? "social-unavailable" : ""}
                target="_blank"
                rel="noreferrer"
                onClick={!hasLinkedin ? (e) => e.preventDefault() : undefined}
              >
                <Linkedin />
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Card;