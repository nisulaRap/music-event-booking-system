import { Link } from "react-router-dom"

function Navbar() {
  return (
    <nav className="bg-black text-white p-4 flex justify-between">
      <h1 className="text-xl font-bold">Music Booking</h1>

      <div className="space-x-6">
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>
        <Link to="/create">Add Event</Link>
      </div>
    </nav>
  )
}

export default Navbar