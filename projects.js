const projects = [
  {
      title: "3D Audio Visualizer",
      description: "Using perlin noise to visualize audio frequency on an icosahedron.",
      image: "public/thumbnail_audio_visualizer.png",
      link: "projects/3D-Audio-Visualizer/index.html"
  },
  {
      title: "More coming soon",
      description: "I had fun with my first project, so I'll keep making more :)",
      image: "#",
      link: "#"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("projects-container");
  projects.forEach(project => {
      const card = document.createElement("div");
      card.className = "project-card";
      
      const img = document.createElement("img");
      img.src = project.image;
      img.alt = project.title;
      
      const descriptionDiv = document.createElement("div");
      descriptionDiv.className = "project-description";
      
      const h2 = document.createElement("h2");
      h2.textContent = project.title;
      
      const p = document.createElement("p");
      p.textContent = project.description;
      
      const a = document.createElement("a");
      a.href = project.link;
      a.target = "_blank";
      a.textContent = "View Project";
      
      descriptionDiv.appendChild(h2);
      descriptionDiv.appendChild(p);
      descriptionDiv.appendChild(a);
      
      card.appendChild(img);
      card.appendChild(descriptionDiv);
      
      container.appendChild(card);
  });
});