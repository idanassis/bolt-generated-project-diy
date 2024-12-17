'use client'
import Image from 'next/image'
import { ScrollReveal } from './ScrollReveal'

const projects = [
  {
    title: 'Project 1',
    description: 'A brief description of Project 1',
    image: '/placeholder.svg?height=300&width=400',
    link: '#',
  },
  {
    title: 'Project 2',
    description: 'A brief description of Project 2',
    image: '/placeholder.svg?height=300&width=400',
    link: '#',
  },
  {
    title: 'Project 3',
    description: 'A brief description of Project 3',
    image: '/placeholder.svg?height=300&width=400',
    link: '#',
  },
]

const Projects = () => {
  return (
    <section id="projects" className="py-20 bg-gray-100">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <h2 className="text-3xl font-bold text-center mb-12">My Projects</h2>
        </ScrollReveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <ScrollReveal key={project.title}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  <a
                    href={project.link}
                    className="text-blue-500 hover:text-blue-600 font-semibold"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Project
                  </a>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects
