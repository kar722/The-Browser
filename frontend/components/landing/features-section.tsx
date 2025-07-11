"use client";

import { motion } from "framer-motion";
import { LineChart, MessageSquareText, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Game Log Explorer",
    description: "Browse every performance with filters, visuals, and highlights.",
    icon: LineChart,
  },
  {
    title: "Ask The Brow (AI)",
    description: "Ask any question about AD's stats, history, or highlights.",
    icon: MessageSquareText,
  },
  {
    title: "Career Visualizations",
    description: "Interactive charts showing his evolution from Pelicans rookie to Lakers champion.",
    icon: Trophy,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function FeaturesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4 md:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 