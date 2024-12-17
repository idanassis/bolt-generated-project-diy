'use client'
import { ScrollReveal } from './ScrollReveal'
import { FaBriefcase, FaGraduationCap } from 'react-icons/fa'
import { useEffect, useState } from 'react'

const calculateDuration = (startDate, endDate = new Date()) => {
  const start = new Date(startDate)
  const end = endDate === 'Present' ? new Date() : new Date(endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const years = Math.floor(diffDays / 365)
  const months = Math.floor((diffDays % 365) / 30)

  if (years > 0 && months > 0) {
    return `${years} yr${years > 1 ? 's' : ''} ${months} mo${months > 1 ? 's' : ''}`
  } else if (years > 0) {
    return `${years} yr${years > 1 ? 's' : ''}`
  } else if (months > 0) {
    return `${months} mo${months > 1 ? 's' : ''}`
  } else {
    return 'Less than a month'
  }
}

const experiences = [
  {
    company: 'Intel Corporation',
    startDate: '2021-11-01',
    roles: [
      {
        title: 'Machine Learning Engineer',
        startDate: '2024-08-01',
        endDate: 'Present',
        description: 'Developing and implementing machine learning models and solutions.',
      },
      {
        title: 'Data Analyst',
        startDate: '2023-06-01',
        endDate: '2024-08-01',
        description: 'Analyzed complex datasets to derive insights and support decision-making processes.',
      },
      {
        title: 'System Validation Engineer',
        startDate: '2021-11-01',
        endDate: '2023-06-01',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      }
    ]
  },
  {
    company: 'Holon Institute of Technology',
    startDate: '2023-08-01',
    roles: [
      {
        title: 'Research Associate',
        startDate: '2023-08-01',
        endDate: 'Present',
        description: 'NeuroAI Communication and Cognition Lab',
      }
    ]
  }
]

const education = [
  {
    degree: "M.Sc. in Electrical Engineering",
    school: 'Bar-Ilan University',
    startDate: '2024-01-01',
    endDate: '2026-01-01',
    description: 'Currently pursuing. Specializing in Data Science and Signal Processing track.',
  },
  {
    degree: "B.Sc. in Electrical Engineering",
    school: 'Holon Institute of Technology',
    startDate: '2020-01-01',
    endDate: '2024-01-01',
    description: 'Graduated with honors (cum laude). Average grade: 94.12. Dean\'s list for 3 consecutive years.',
  },
]

const TimelineItem = ({ item, isLast }) => {
  const [duration, setDuration] = useState('')

  useEffect(() => {
    setDuration(calculateDuration(item.startDate, item.endDate))
  }, [item.startDate, item.endDate])

  return (
    <div className="flex">
      <div className="flex flex-col items-center mr-4">
        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
        {!isLast && <div className="h-full w-0.5 bg-gray-300 mt-1"></div>}
      </div>
      <div className="pb-8">
        <h3 className="text-xl font-bold">{item.title || item.degree}</h3>
        <p className="text-lg font-semibold">{item.company || item.school}</p>
        <p className="text-gray-600 mb-2">
          {`${new Date(item.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
          ${item.endDate === 'Present' ? 'Present' : new Date(item.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} · ${duration}`}
        </p>
        <p className="text-gray-700">{item.description}</p>
      </div>
    </div>
  )
}

const ExperienceItem = ({ experience }) => {
  const [totalDuration, setTotalDuration] = useState('')

  useEffect(() => {
    setTotalDuration(calculateDuration(experience.startDate))
  }, [experience.startDate])

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold">{experience.company}</h3>
      <p className="text-gray-600 mb-4">{totalDuration}</p>
      {experience.roles.map((role, index) => (
        <TimelineItem key={index} item={role} isLast={index === experience.roles.length - 1} />
      ))}
    </div>
  )
}

const Experience = () => {
  return (
    <section id="experience" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <h2 className="text-3xl font-bold text-center mb-12">My Journey</h2>
        </ScrollReveal>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <ScrollReveal>
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <FaBriefcase className="mr-2 text-blue-500" /> Work Experience
              </h3>
            </ScrollReveal>
            {experiences.map((exp, index) => (
              <ScrollReveal key={index}>
                <ExperienceItem experience={exp} />
              </ScrollReveal>
            ))}
          </div>
          
          <div>
            <ScrollReveal>
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <FaGraduationCap className="mr-2 text-green-500" /> Education
              </h3>
            </ScrollReveal>
            {education.map((edu, index) => (
              <ScrollReveal key={index}>
                <TimelineItem item={edu} isLast={index === education.length - 1} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Experience
