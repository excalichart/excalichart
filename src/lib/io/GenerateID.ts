const generateID = () => '_' + Math.random().toString(36).substr(2, 9);

export { generateID };
