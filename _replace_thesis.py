#!/usr/bin/env python3
"""Replace the two-paragraph investment thesis with the new single paragraph."""
import re

FILE = r'components/CommandCenter.tsx'

with open(FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# The old block: two <p> tags + the "Until now." <p>
old_block = '''                            <p>
                                The tools that shape global capital&mdash;the risk indices, the advisory frameworks, the investment models&mdash;were calibrated on a world that prioritised concentration. A handful of tier-one cities cross-referenced against each other until the data confirmed the bias. Every place that didn&rsquo;t fit that template was classified as &ldquo;emerging,&rdquo; &ldquo;high-risk,&rdquo; or simply absent from the analysis. That classification became self-fulfilling. Capital avoided the regions. The regions lacked the proof. The proof required the capital.
                            </p>
                            <p>
                                What broke wasn&rsquo;t the regions. What broke was the intelligence layer. The corridors that route global supply chains, the cities that anchor national food systems, the hubs that house the industrial workforce&mdash;none of them were ever given a language that institutional decision-makers could read. They built economies without being legible to the people with the resources to accelerate them. That&rsquo;s not a data shortage. It&rsquo;s a structural blindspot&mdash;and it has never had a purpose-built solution.
                            </p>
                            <p className="text-slate-900 font-semibold">
                                Until now.
                            </p>'''

new_block = '''                            <p>
                                Regional cities are the backbone of every national economy and the connective tissue of the global one&mdash;they house the workforce, anchor the food systems, drive the manufacturing, and route the supply chains that keep countries running&mdash;yet the tools that decide where capital flows were calibrated on a handful of tier-one cities, cross-referenced against each other until the data confirmed the bias, and every place outside that loop was labelled &ldquo;emerging,&rdquo; &ldquo;high-risk,&rdquo; or left off the map entirely. That classification became self-fulfilling: capital avoided the regions, the regions couldn&rsquo;t produce the proof, and the proof required the capital&mdash;not because these places lacked value, but because they were never given a language that institutional decision-makers could read, and the tools that came close were priced for the institutions that already had the access. That&rsquo;s not a data shortage&mdash;it&rsquo;s a structural blindspot, and it has never had a purpose-built, affordable solution.
                            </p>
                            <p className="text-slate-900 font-semibold text-xl mt-4">
                                Until now.
                            </p>'''

assert old_block in content, "Could not find old block to replace"
content = content.replace(old_block, new_block)
print("Replaced investment thesis text")

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
