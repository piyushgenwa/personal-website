import { Backdrop } from '@/components/Backdrop';
import { Camera } from '@/components/Camera';
import { chapters, person } from '@/content/book';

export default function Home() {
  return (
    <main className="stage">
      <Backdrop />
      <Camera />

      {/* The camera is interactive; this is the same résumé for anyone without JavaScript. */}
      <noscript>
        <div className="noscript glass">
          <h1>{person.name}</h1>
          <p>{person.title}</p>
          {chapters.map((c) =>
            c.roles.map((r) => (
              <section key={c.id + r.title}>
                <h2>
                  {r.title}, {c.title} ({r.dates})
                </h2>
                <ul>
                  {r.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </section>
            )),
          )}
          <p>
            <a href={`mailto:${person.email}`}>{person.email}</a>
          </p>
        </div>
      </noscript>
    </main>
  );
}
