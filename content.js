/* ============================================================
   For Sandra · letter content
   ····························································
   This is the ONLY file you need to touch to change the words.
   Each entry is one screen. Lines appear one by one.

   type:   "chapter" | "ending"
   label:  private note to self (not displayed)
   tone:   tone-0 … tone-9 (background mood, see styles.css)
   lines:  paragraphs; <em> soft, <strong> strong, <br> allowed
   ============================================================ */

window.LETTER = {
  to: "Sandra Sol",
  signature: "Panashe",

  sections: [
    /* 01 · thank you */
    {
      type: "chapter",
      label: "Thank you",
      tone: "tone-0",
      lines: [
        "Hey.",
        "Thank you for wishing me a safe flight.",
        "<em>And I understand the circumstances.</em>"
      ]
    },

    /* 02 · the apology */
    {
      type: "chapter",
      label: "The apology",
      tone: "tone-1",
      lines: [
        "I&rsquo;ve been meaning to say that I&rsquo;m sorry.",
        "I apologize for how awkward I made things seem."
      ]
    },

    /* 03 · the apology continues */
    {
      type: "chapter",
      label: "The apology",
      tone: "tone-1",
      lines: [
        "I just wanted you to know that I could have handled the situation better.",
        "<em>Even after everything happened, I was still trying to find the right words to say.</em>"
      ]
    },

    /* 04 · why the silence */
    {
      type: "chapter",
      label: "Why the silence",
      tone: "tone-6",
      lines: [
        "I was still thinking and processing the right words to say.",
        "<em>If you could tell, I tried to laugh and be happy with you.</em>",
        "<em>I wasn&rsquo;t mad at you.</em>"
      ]
    },

    /* 05 · why the silence continues */
    {
      type: "chapter",
      label: "Why the silence",
      tone: "tone-6",
      lines: [
        "I still needed to find the right words to address what was going on.",
        "I didn&rsquo;t mean to make things awkward by taking that time."
      ]
    },

    /* 06 · the days after */
    {
      type: "chapter",
      label: "The days after",
      tone: "tone-8",
      lines: [
        "Even after those four or five days, I still hadn&rsquo;t found the right words to address the whole situation.",
        "I was genuinely trying to process everything and figure out how to say what I needed to say without making things worse."
      ]
    },

    /* 07 · what I wish I had done differently */
    {
      type: "chapter",
      label: "What I wish I had done differently",
      tone: "tone-2",
      lines: [
        "It&rsquo;s unfortunate that you&rsquo;re no longer around.",
        "I&rsquo;m sorry that the situation broke your heart.",
        "<em>I guess that means I&rsquo;m responsible too.</em>"
      ]
    },

    /* 08 · what I really wish */
    {
      type: "chapter",
      label: "What I really wish",
      tone: "tone-5",
      lines: [
        "I really wish I could have handled things differently.",
        "I really wish we were still talking."
      ]
    },

    /* 09 · taking responsibility */
    {
      type: "chapter",
      label: "Taking responsibility",
      tone: "tone-7",
      lines: [
        "Just because something isn&rsquo;t right doesn&rsquo;t give me an excuse to be reckless with what I say.",
        "<strong>I know that some words can sting for a lifetime.</strong>"
      ]
    },

    /* 10 · understanding your decision */
    {
      type: "chapter",
      label: "Understanding your decision",
      tone: "tone-3",
      lines: [
        "I know when you said you would come back around, that was probably just you being nice.",
        "And I know you probably aren&rsquo;t going to come back.",
        "<em>But I really miss you every day.</em>"
      ]
    },

    /* 11 · respect */
    {
      type: "chapter",
      label: "Respect",
      tone: "tone-4",
      lines: [
        "I&rsquo;m probably never going to bother you again, because I respect you.",
        "I love you, and I care about your peace of mind."
      ]
    },

    /* 12 · respect continues */
    {
      type: "chapter",
      label: "Respect",
      tone: "tone-4",
      lines: [
        "I don&rsquo;t want this message to put any pressure on you.",
        "<em>I just needed you to know how I feel.</em>"
      ]
    },

    /* 13 · closing */
    {
      type: "chapter",
      label: "Closing",
      tone: "tone-9",
      lines: [
        "Anyway, I just needed you to know.",
        "<strong>I&rsquo;m sorry.</strong>"
      ]
    },

    /* end screen */
    { type: "ending" }
  ]
};
