export default function FindUsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-3"
            style={{ color: 'var(--color-text-main)' }}>
            Encuéntranos
          </h2>
          <p className="text-base max-w-2xl mx-auto"
            style={{ color: 'var(--color-text-muted)' }}>
            Visítanos en nuestra tienda y descubre nuestra selección de carnes premium
          </p>
        </div>

        <div className="rounded-xl overflow-hidden"
          style={{ border: '0.5px solid var(--color-warm-border)' }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2988.6231346460927!2d2.3514232764811247!3d41.49076938957564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a4b1f0fd06371b%3A0x839a8307d5eed5a2!2sCARNICERIA%20EL%20URU!5e0!3m2!1sca!2ses!4v1780506459427!5m2!1sca!2ses"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  )
}
