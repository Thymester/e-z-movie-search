import React from 'react';
import '../css/retro-styles.css'; // Import the retro styles CSS
import '../App.css';

const About = () => {
  return (
    <div className="about retro-bg">
      <h2 className="about-title">About Us</h2>
      <div className="about-content">
        <p>
          Welcome to our website! We aim to take you on a journey through the evolution of web design.
        </p>
        <p>
          In the 1990s, websites were simple and static, often with plain text, limited color options, and basic HTML layouts. The design was dictated by the limitations of the time, including slow internet speeds and the infancy of web technologies. Tables were often used for layout, and interactivity was minimal.
        </p>
        <p>
          As we transitioned into the early 2000s, advancements in HTML, CSS, and JavaScript led to more colorful designs, better layouts, and the use of images. Flash, although not SEO-friendly, became popular for creating interactive and animated content.
        </p>
        <p>
          Fast forward to the present day, and we are in an era of modern web design. CSS frameworks and libraries, such as Bootstrap and Material-UI, have simplified design processes, resulting in sleek, intuitive, and responsive websites. Mobile-first design is a standard practice, with a focus on optimal user experiences across various devices.
        </p>
      </div>
      <h3 className="about-subtitle">Modern Website Design</h3>
      <div className="about-content">
        <h4>Responsive Design with CSS Grid and Flexbox</h4>
        <p>Modern websites use CSS Grid and Flexbox to create flexible and responsive layouts. These technologies allow for complex grid systems and flexible arrangements of elements.</p>
        
        <h4>Minimalistic UI with Material Design</h4>
        <p>Material Design principles emphasize clean and minimalistic user interfaces, focusing on clarity and efficiency. It involves consistent use of grid-based layouts, responsive animations, and depth effects.</p>
        
        <h4>Engaging Animations with CSS Transitions and Animations</h4>
        <p>CSS Transitions and Animations enable smooth and engaging animations on modern websites. They are used to enhance user experience by providing subtle transitions and effects.</p>
      </div>
    </div>
  );
};

export default About;
