"use client";

import { motion } from "framer-motion";
import { Mail, Github, Linkedin, Instagram, Send } from "lucide-react";
import { useState } from "react";
import { textColorAnimation } from "./animations";

const Connect = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<null | "success" | "error">(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        throw new Error("Form submission failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const socialLinks = [
    {
      icon: <Github className="w-5 h-5" />,
      url: "https://github.com/kiracheung0211",
      label: "GitHub",
    },
    {
      icon: <Linkedin className="w-5 h-5" />,
      url: "https://linkedin.com/in/kira-cheung",
      label: "LinkedIn",
    },
    {
      icon: <Instagram className="w-5 h-5" />,
      url: "https://instagram.com/kkiracheungg",
      label: "Instagram",
    },
  ];

  return (
    <section id="connect" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            className="text-5xl font-bold mb-4"
            initial={textColorAnimation.initial}
            whileInView={textColorAnimation.whileInView}
                        viewport={textColorAnimation.viewport}
          >
            Let&apos;s Connect
          </motion.h2>
          <motion.p
            className="text-xl max-w-2xl mx-auto indie-flower-regular text-white"
            initial={textColorAnimation.initial}
            whileInView={textColorAnimation.whileInView}
                        viewport={textColorAnimation.viewport}
          >
            Have a project in mind or just want to say hi? Feel free to reach
            out!
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <motion.div
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg p-8 h-full text-white"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.h3 className="text-2xl font-semibold mb-6 text-white" initial={textColorAnimation.initial} whileInView={textColorAnimation.whileInView} viewport={textColorAnimation.viewport}>
              Send me a message
            </motion.h3>

            {submitStatus === "success" && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
                Thank you for your message! I&apos;ll get back to you soon.
              </div>
            )}

            {submitStatus === "error" && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                Oops! Something went wrong. Please try again later or email me
                directly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-white mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 text-white placeholder:text-white/40 border border-white/15 rounded-lg focus:ring-2 focus:ring-[#412D15] focus:border-[#412D15] outline-none transition"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 text-white placeholder:text-white/40 border border-white/15 rounded-lg focus:ring-2 focus:ring-[#412D15] focus:border-[#412D15] outline-none transition"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-white mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 text-white placeholder:text-white/40 border border-white/15 rounded-lg focus:ring-2 focus:ring-[#412D15] focus:border-[#412D15] outline-none transition resize-none"
                  placeholder="Your message here..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#412D15] hover:bg-[#2e2010] text-white font-medium py-3 px-6 rounded-lg transition flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Contact Info */}

          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg p-8 text-white">
              <motion.h3 className="text-2xl font-semibold mb-6 text-white" initial={textColorAnimation.initial} whileInView={textColorAnimation.whileInView} viewport={textColorAnimation.viewport}>
                Contact Info
              </motion.h3>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <a href="mailto:kiracheung0211@gmail.com">
                    <div className="w-12 h-12 rounded-full bg-[#412D15] flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-[#2e2010] transition-colors">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                  </a>

                  <a
                    href="mailto:kiracheung0211@gmail.com"
                    className="text-white font-medium hover:opacity-70 transition-opacity"
                  >
                    Email me :)
                  </a>

                </div>

                <div className="pt-6 border-t border-white/10">
                  <h4 className="font-medium text-white mb-4">Follow Me</h4>
                  <div className="flex space-x-4">
                    {socialLinks.map((link, index) => (
                      <motion.a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-full bg-white/5 hover:bg-[#412D15] flex items-center justify-center text-white hover:text-white transition-colors border border-white/15"
                        whileHover={{ y: -4, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        aria-label={link.label}
                      >
                        {link.icon}
                      </motion.a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Connect;
