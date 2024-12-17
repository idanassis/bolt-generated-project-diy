'use client'
import { motion } from 'framer-motion'
import Chat from './Chat'

const Hero = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="container mx-auto px-4 py-8 md:py-16 flex flex-col md:flex-row items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-[45%] mb-8 md:mb-0"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Hi, I'm Idan Assis</h1>
          <h2 className="text-2xl md:text-3xl text-gray-600 mb-6">Data Science & ML Engineer</h2>
          <p className="text-lg mb-8">
            Currently working at Intel and pursuing my Master's in Electrical Engineering, 
            majoring in Data Science and Signal Processing. I'm passionate about leveraging 
            data and machine learning to solve complex problems.
          </p>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-600 transition duration-300"
          >
            Get in Touch
          </motion.a>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-[45%] flex justify-center"
        >
          <Chat />
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
