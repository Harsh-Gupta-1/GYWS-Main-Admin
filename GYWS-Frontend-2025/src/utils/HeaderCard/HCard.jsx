import './HCard.css'

export default function HCard(props) {
  return (
    <>
      <div className="nam">
        <h2>{props.head} <br /><div className="line"></div></h2>
      </div>
    </>
  )
}