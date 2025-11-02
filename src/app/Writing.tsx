import React from "react";
import { ChevronRight, Calendar } from "lucide-react";
import SectionHeader from "../components/section-header";
import { motion } from "framer-motion";
import { textColorAnimation } from "../components/animations";
// Article data in JSON format
const articles = [
  {
    id: 1,
    date: "December 14, 2024",
    title: "The Death of Choice? Navigating Agency in the AI Era",
    url: "https://medium.com/@kiracheung/so-someone-asked-me-about-ai-0bbaa7360557",
    paragraphs: [
      "You wake up in the morning and your smart home has already adjusted the temperature, started the coffee maker, and queued up your favorite playlist. As you scroll through your social feeds, algorithms curate the perfect blend of news, memes, and updates from friends. You hop in your car and your GPS maps out the fastest route to work, steering you clear of traffic jams.",
      "But here's the thing: as AI gets better at predicting our wants and needs, it's also quietly shaping the choices we make. Those playlist recommendations, GPS routes, and social media feeds? They're all guided by AI algorithms designed to hook us and keep us engaged",
      "As AI takes more and more little decisions off our plate, it raises some big questions: Are we really the ones steering the ship anymore? Or are we letting AI chart the course of our lives? When algorithms influence so much of what we see, do, and even feel, are we still truly thinking for ourselves?",
    ],
  },
  // Add more articles here in the same format
];

const Writing = () => {
  return (
    <div id="writing" className="flex h-fit ">
      {/* Main Content */}
      <div className="flex flex-col justify-center items-center w-full px-8 max-sm:px-2 gap-6">
        <SectionHeader
          title="Writings"
          subtitle="Thoughts on AI, startups & VC"
        />
        <div className="max-w-screen-xl mx-auto h-fit">
          {articles.map((article) => (
            <div
              key={article.id}
              className="w-full rounded-3xl overflow-hidden bg-gray-100"
            >
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-8 py-10"
              >
                <div className="flex items-center text-gray-500 mb-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{article.date}</span>
                </div>
                <motion.h1 className="text-4xl font-bold pb-5" {...textColorAnimation}>{article.title}</motion.h1>

                <div
                  className="relative overflow-hidden"
                  style={{ maxHeight: "300px" }}
                >
                  {article.paragraphs.map((paragraph, index) => (
                    <React.Fragment key={index}>
                      <motion.p {...textColorAnimation}>{paragraph}</motion.p>
                      {index < article.paragraphs.length - 1 && <br />}
                    </React.Fragment>
                  ))}

                  {/* Gradient Overlay */}
                  <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-gray-100 to-transparent" />
                </div>

                {/* Read More Link */}
                <div className="mt-4 flex items-center text-xl text-[#FD652D] hover:opacity-70 transition-opacity">
                  Read full article on Medium
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Writing;
