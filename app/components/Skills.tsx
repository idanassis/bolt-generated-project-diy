'use client'
import { FaReact, FaNodeJs, FaPython, FaDatabase, FaChartBar, FaBrain, FaWaveSquare } from 'react-icons/fa'
import { SiTypescript, SiTailwindcss, SiTensorflow, SiPytorch } from 'react-icons/si'
import { ScrollReveal } from './ScrollReveal'

const skills = [
  { name: 'Data Science', icon: FaChartBar, color: 'text-blue-500' },
  { name: 'Machine Learning', icon: FaBrain, color: 'text-green-500' },
  { name: 'Signal Processing', icon: FaWaveSquare, color: 'text-yellow-500' },
  { name: 'Python', icon: FaPython, color: 'text-blue-600' },
  { name: 'TensorFlow', icon: SiTensorflow, color: 'text-orange-500' },
  { name: 'PyTorch', icon: SiPytorch, color: 'text-red-500' },
]

const Skills = () => {
  return (
    <section id="skills" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <h2 className="text-3xl font-bold text-center mb-12">My Skills</h2>
        </ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {skills.map((skill, index) => (
            <ScrollReveal key={skill.name}>
              <div className="flex flex-col items-center">
                <skill.icon className={`text-6xl ${skill.color} mb-4`} />
                <h3 className="text-xl font-semibold">{skill.name}</h3>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Skills
