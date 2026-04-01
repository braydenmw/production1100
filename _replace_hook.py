#!/usr/bin/env python3
"""Replace the long paragraph with the short hook version."""

FILE = r'components/CommandCenter.tsx'

with open(FILE, 'r', encoding='utf-8') as f:
    content = f.read()

old = '''                            <p>
                                Regional cities are the backbone of every national economy and the connective tissue of the global one&mdash;they house the workforce, anchor the food systems, drive the manufacturing, and route the supply chains that keep countries running&mdash;yet the tools that decide where capital flows were calibrated on a handful of tier-one cities, cross-referenced against each other until the data confirmed the bias, and every place outside that loop was labelled &ldquo;emerging,&rdquo; &ldquo;high-risk,&rdquo; or left off the map entirely. That classification became self-fulfilling: capital avoided the regions, the regions couldn&rsquo;t produce the proof, and the proof required the capital&mdash;not because these places lacked value, but because they were never given a language that institutional decision-makers could read, and the tools that came close were priced for the institutions that already had the access. That&rsquo;s not a data shortage&mdash;it&rsquo;s a structural blindspot, and it has never had a purpose-built, affordable solution.
                            </p>
                            <p className="text-slate-900 font-semibold text-xl mt-4">
                                Until now.
                            </p>'''

new = '''                            <p>
                                Regional cities power every national economy&mdash;they house the workforce, feed the population, run the factories, and route the supply chains&mdash;yet the tools that decide where global capital flows have never been built to see them. Capital followed the indices, the indices only measured tier-one cities, and everywhere else was written off as &ldquo;emerging&rdquo; or &ldquo;high-risk.&rdquo; The problem was never the regions. It was the intelligence layer&mdash;and until now, a purpose-built, affordable solution has never existed.
                            </p>
                            <p className="text-slate-900 font-semibold text-xl mt-4">
                                Until now.
                            </p>'''

assert old in content, "Could not find old block"
content = content.replace(old, new)

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
