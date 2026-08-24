export default function Cookies() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-celeste)' }}>Política de Cookies</h1>
      <div className="text-gray-700 space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. ¿Qué son las cookies?</h2>
          <p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web. Se utilizan para recordar sus preferencias y mejorar su experiencia de navegación.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Tipos de cookies que utilizamos</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Cookies técnicas:</strong> Necesarias para el funcionamiento del sitio web.</li>
            <li><strong>Cookies de preferencias:</strong> Recuerdan sus configuraciones de idioma y otras preferencias.</li>
            <li><strong>Cookies de análisis:</strong> Nos ayudan a entender cómo utiliza el sitio para mejorarlo.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Cookies de terceros</h2>
          <p>Este sitio puede utilizar servicios de terceros que también utilizan cookies, como Google Analytics para el análisis de tráfico.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Gestión de cookies</h2>
          <p>Puede configurar su navegador para rechazar cookies o eliminar las cookies ya instaladas. Tenga en cuenta que esto puede afectar el funcionamiento del sitio web.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Actualizaciones</h2>
          <p>Podemos actualizar esta política de cookies periódicamente. Le recomendamos revisar esta página regularmente para estar informado sobre cualquier cambio.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Contacto</h2>
          <p>Si tiene alguna pregunta sobre nuestra política de cookies, puede contactarnos en info@eluru.es.</p>
        </section>
      </div>
    </div>
  )
}
