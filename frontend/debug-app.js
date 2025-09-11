// Debug version of the React App
console.log('Debug app starting...');

const { useState, useEffect } = React;

// Simple test component first
const TestApp = () => {
  console.log('TestApp rendering...');
  
  return React.createElement('div', { 
    style: { 
      padding: '2rem', 
      backgroundColor: 'white', 
      margin: '2rem',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    } 
  }, [
    React.createElement('h1', { 
      key: 'title',
      style: { color: '#2563eb' }
    }, 'Debug App Working!'),
    React.createElement('p', { key: 'message' }, 'If you can see this, React is working correctly.')
  ]);
};

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready, initializing app...');
  const root = document.getElementById('root');
  if (root) {
    console.log('Root element found, rendering app...');
    ReactDOM.render(React.createElement(TestApp), root);
  } else {
    console.error('Root element not found!');
  }
});

console.log('Debug app script loaded successfully');