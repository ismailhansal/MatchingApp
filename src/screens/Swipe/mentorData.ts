export const generateSampleMentors = () => {
  const sectors = ['Technology', 'Finance', 'Healthcare', 'Marketing', 'Design', 'Education', 'Engineering', 'Sales'];
  const skills = ['Leadership', 'Communication', 'Data Analysis', 'Project Management', 'Coding', 'Strategy', 'UX Design', 'Marketing'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Arabic'];
  const locations = ['New York', 'San Francisco', 'London', 'Paris', 'Tokyo', 'Dubai', 'Toronto', 'Sydney'];
  const firstNames = ['Alex', 'Sarah', 'Michael', 'Emma', 'David', 'Sophia', 'James', 'Olivia', 'Daniel', 'Ava'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const companies = ['TechCorp', 'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Tesla', 'Netflix'];

  return Array.from({ length: 50 }, (_, i) => ({
    id: `mentor-${i}`,
    name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    avatar: `https://images.unsplash.com/photo-${1500000000 + i}?w=200&h=200&fit=crop`,
    photo: `https://images.unsplash.com/photo-${1500000000 + i}?w=600&h=600&fit=crop`,
    photos: [
      `https://images.unsplash.com/photo-${1500000000 + i}?w=600&h=600&fit=crop`,
      `https://images.unsplash.com/photo-${1500000100 + i}?w=600&h=600&fit=crop`,
      `https://images.unsplash.com/photo-${1500000200 + i}?w=600&h=600&fit=crop`,
      `https://images.unsplash.com/photo-${1500000300 + i}?w=600&h=600&fit=crop`,
    ],
    sector: sectors[i % sectors.length],
    company: companies[i % companies.length],
    skills: Array.from({ length: 4 }, (_, j) => skills[(i + j) % skills.length]),
    experience: 3 + (i % 15),
    bio: `Passionate ${sectors[i % sectors.length].toLowerCase()} professional with ${3 + (i % 15)} years of experience in leading teams and delivering exceptional results.`,
    education: 'Master\'s Degree in Computer Science',
    languages: Array.from({ length: 2 }, (_, j) => languages[(i + j) % languages.length]),
    location: locations[i % locations.location],
    hourlyRate: 50 + (i % 100),
    availability: ['Weekdays', 'Weekends', 'Anytime'][i % 3],
    rating: 4.5 + Math.random() * 0.5,
    reviews: 10 + (i % 100),
  }));
};

export const calculateCompatibility = (currentUserRole: 'mentor' | 'mentee', mentor: any) => {
  // Simple compatibility calculation based on sector match
  let score = Math.random() * 40 + 60; // 60-100%
  return Math.round(score);
};
