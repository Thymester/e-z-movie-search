import React from 'react';
import '../css/retro-styles.css';
import '../App.css';

const Home = () => {
  return (
    <div className="home retro-bg">
      <h2 className="home-title">Welcome to the Evolution of Web Design</h2>
      <p className="home-subtitle">Journey through the transformation of web pages over the years.</p>
      <div className="home-content">
        <h3 className="modern-title">Modern Website Design</h3>
        <div className="modern-card-content">
          <h4>Responsive Design</h4>
          <p>Modern websites are designed to adapt and provide a seamless experience across various devices, including desktops, tablets, and smartphones.</p>
        </div>
        <div className="modern-card-content">
          <h4>Minimalistic UI</h4>
          <p>Clean and minimalistic user interfaces with ample white space, clear typography, and intuitive navigation are hallmarks of modern design.</p>
        </div>
        <div className="modern-card-content">
          <h4>Engaging Animations</h4>
          <p>Subtle animations and transitions enhance user engagement and provide a more dynamic and enjoyable browsing experience.</p>
        </div>
        <p>
          This website is a tribute to the ever-changing world of web design. Our goal is to take you on a journey back in time to explore how websites looked and felt in the 90s and early 2000s, and compare them to the sleek and modern designs we see today.
        </p>
        <p>
          Back in the early days, websites were simple, often with plain backgrounds, basic layouts, and minimal interactivity. As we progressed into the 2000s, designs became more colorful, dynamic, and interactive with the advent of CSS and JavaScript. Today, we have evolved into an era of responsive design, smooth animations, and intuitive user experiences.
        </p>
        <p>
          Join us as we reminisce about the past and celebrate the incredible evolution of web design. Click on the "About" page to learn more about the history and evolution of websites.
        </p>
      </div>
    </div>
  );
};

export default Home;
