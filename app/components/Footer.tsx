import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>&copy; 2023 Idan Assis. All rights reserved.</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
              <FaGithub className="text-2xl" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
              <FaLinkedin className="text-2xl" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
              <FaTwitter className="text-2xl" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
