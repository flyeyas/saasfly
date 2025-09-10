"use client";

import React from "react";

import { InfiniteMovingCards } from "@saasfly/ui/infinite-moving-cards";

export function InfiniteMovingCardss() {
  return (
    <div className=" relative flex flex-col items-center justify-center overflow-hidden rounded-md antialiased">
      <InfiniteMovingCards items={reviews} direction="right" speed="slow" />
    </div>
  );
}

const reviews = [
  {
    quote:
      "This SaaS service is truly an office powerhouse! Its features are incredibly robust and the interface is very user-friendly. Since using it, my work efficiency has improved significantly. I'm really glad I chose this service.",
    name: "David Wang",
    title: "Premium User",
  },
  {
    quote:
      "I've tried many SaaS services before, but this one really stands out. It offers a wide range of features and integrates seamlessly with other tools I use. The customer support is also top-notch. Highly recommended!",
    name: "John Smith",
    title: "Power User",
  },
  {
    quote:
      "I'm truly grateful for this SaaS service. Thanks to it, my work efficiency has improved dramatically. It's feature-rich and has an attractive, easy-to-use interface. I want to continue using it forever.",
    name: "Taro Yamada",
    title: "Gold User",
  },
  {
    quote:
      "I am very satisfied with this SaaS service. Not only are the features diverse and powerful, but the customer support is also excellent. Thanks to this service, my work performance has improved significantly. I highly recommend it!",
    name: "Michael Kim",
    title: "VIP User",
  },
  {
    quote:
      "This SaaS service has revolutionized the way our team works. It's feature-rich, user-friendly, and the pricing is quite competitive. We've seen a significant boost in our productivity since we started using it.",
    name: "Emily Johnson",
    title: "Verified Buyer",
  },
];
