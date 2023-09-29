import React from 'react';
import '../css/modern-page-styles.css';

const ModernPage = () => {
    return (
      <div className="modern-page">
        <div className="modern-header">
          <h1 className="modern-title">Modern Website Design</h1>
          <p className="modern-subtitle">
            Explore the technical and design elements that define modern web design and how they differ from the past.
          </p>
        </div>
        <div className="modern-content">
          <div className="modern-card1">
            <h3>Responsive Design</h3>
            <p>
              Modern websites are designed using responsive web design techniques, allowing them to adapt and provide an optimal experience on various devices. CSS Grid and Flexbox are widely used to create flexible layouts that adjust to the screen size, ensuring a seamless user experience across desktops, tablets, and smartphones.
            </p>
          </div>
          <div className="modern-card2">
            <h3>Minimalistic UI</h3>
            <p>
              Minimalistic UI is a significant trend in modern web design. Designers focus on clean, intuitive, and clutter-free interfaces. Material Design, a design language developed by Google, is a prime example, emphasizing flat design, grid-based layouts, and meaningful use of color and typography for a consistent and delightful user experience.
            </p>
          </div>
          <div className="modern-card1">
            <h3>Engaging Animations</h3>
            <p>
              Modern websites leverage CSS transitions and animations to create engaging and interactive experiences. Smooth animations, subtle transitions, and micro-interactions not only enhance user engagement but also contribute to the overall aesthetics and usability of the website.
            </p>
          </div>
          <div className="modern-card2">
            <h3>Advanced JavaScript Libraries and Frameworks</h3>
            <p>
              The use of advanced JavaScript libraries and frameworks like React, Angular, and Vue.js has become prevalent in modern web development. These libraries enable developers to build complex and interactive user interfaces efficiently, facilitating code reusability, component-based architecture, and state management.
            </p>
          </div>
        </div>
        <div className="modern-summary">
          <h2>Summary</h2>
          <p>
            Modern web design is shaped by technologies and methodologies that allow for responsive layouts, intuitive user interfaces, engaging animations, and efficient development workflows. These advancements result in websites that are not only visually appealing but also provide seamless and interactive experiences across a wide range of devices.
          </p>
        </div>
        <div className="modern-animation">
          <h2>Modern Animations Example</h2>
          <div className="animated-border"></div>
          <div className="animated-background"></div>
        </div>
      </div>
    );
  };

export default ModernPage;
