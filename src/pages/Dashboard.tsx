export function Dashboard() {
  const topCreators = [
    { id: 1, name: 'María García', followers: 1205, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150' },
    { id: 2, name: 'Carlos Mendoza', followers: 954, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150' },
    { id: 3, name: 'Elena Rojas', followers: 830, avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=150' }
  ];

  const topStories = [
    { id: 1, title: 'El secreto de una vida feliz', listens: 4500, creator: 'María García' },
    { id: 2, title: 'Mi viaje en tren por Europa (1975)', listens: 3200, creator: 'Elena Rojas' },
    { id: 3, title: 'La receta del mole de mi madre', listens: 2800, creator: 'Carlos Mendoza' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-newsreader font-bold text-deep-navy mb-4">
          Descubre
        </h1>
        <p className="text-xl text-deep-navy/70">
          Los creadores y las historias más populares de nuestra comunidad.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <section className="card-tonal p-8">
          <h2 className="text-2xl font-newsreader font-bold text-deep-navy mb-6">Creadores Destacados</h2>
          <div className="space-y-6">
            {topCreators.map((creator, index) => (
              <div key={creator.id} className="flex items-center gap-4">
                <span className="text-2xl font-newsreader font-bold text-heritage-gold w-6 text-center">
                  {index + 1}
                </span>
                <img 
                  src={creator.avatar} 
                  alt={creator.name} 
                  className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-surface-subtle"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-deep-navy">{creator.name}</h3>
                  <p className="text-sm text-deep-navy/60">{creator.followers.toLocaleString()} seguidores</p>
                </div>
                <button className="btn-secondary px-4 py-2 text-sm min-h-[40px]">
                  Seguir
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="card-tonal p-8">
          <h2 className="text-2xl font-newsreader font-bold text-deep-navy mb-6">Mejores Historias</h2>
          <div className="space-y-6">
            {topStories.map((story, index) => (
              <div key={story.id} className="flex gap-4 items-start border-b border-surface-subtle last:border-0 pb-4 last:pb-0">
                <span className="text-2xl font-newsreader font-bold text-heritage-gold w-6 text-center shrink-0">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-bold text-lg text-deep-navy leading-tight mb-1">{story.title}</h3>
                  <p className="text-sm text-deep-navy/70 mb-2">Por {story.creator}</p>
                  <p className="text-xs font-medium text-heritage-gold uppercase tracking-wide">
                    {story.listens.toLocaleString()} reproducciones
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
