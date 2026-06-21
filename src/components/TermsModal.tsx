import { modals } from '@mantine/modals';

export function openTermsModal() {
  modals.open({
    title: 'Términos, Condiciones y Privacidad',
    size: 'xl',
    centered: true,
    children: (
      <div className="space-y-6 text-sm text-deep-navy/80 overflow-y-auto max-h-[70vh] pr-2">
        <section>
          <h2 className="text-xl font-bold text-deep-navy mb-4">TÉRMINOS Y CONDICIONES GENERALES DE USO Y COMERCIO ELECTRÓNICO</h2>
          
          <h3 className="font-bold mb-2">1. IDENTIFICACIÓN DEL TITULAR</h3>
          <p className="mb-4">El presente sitio web https://www.pastfinder.cl es operado por Juanny Ramirez Colque, identificada con 14.727.633-8, con domicilio en Av. las americas, alto hospicio, chile. La marca comercial Past Finder es propiedad de Juanny Ramirez Colque y es utilizada para el desarrollo de sus actividades comerciales de distribución de contenido digital.<br/>
          Correo electrónico de contacto: pastfinder.oficial@gmail.com<br/>
          Teléfono de atención al cliente: +56972263172</p>

          <h3 className="font-bold mb-2">2. ACEPTACIÓN DE LOS TÉRMINOS Y CONDICIONES</h3>
          <p className="mb-4">El acceso, navegación, registro y utilización del sitio web implica la aceptación expresa, plena e incondicional de los presentes Términos y Condiciones por parte de todos los usuarios, ya sean Creadores de Contenido (en adelante, "Creadores") o Suscriptores.</p>

          <h3 className="font-bold mb-2">3. DESCRIPCIÓN DE LA PLATAFORMA Y SERVICIOS</h3>
          <p className="mb-4">Past Finder es un sitio web de suscripción que permite a los adultos mayores (y/o creadores autorizados) publicar, compartir y monetizar sus historias, memorias, textos y material digital (en adelante, el "Contenido"). Los usuarios que deseen acceder a dicho Contenido exclusivo deberán abonar una tarifa de suscripción periódica establecida en la plataforma.</p>

          <h3 className="font-bold mb-2">4. REGISTRO DE USUARIOS Y TIPOS DE CUENTA</h3>
          <p className="mb-2">Para interactuar en la plataforma, los usuarios deben registrarse y declarar que cuentan con la capacidad legal mínima requerida en su país de residencia.</p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>Cuenta de Suscriptor:</strong> Permite a los usuarios navegar por la web, gestionar su perfil y adquirir suscripciones para visualizar el Contenido de los Creadores.</li>
            <li><strong>Cuenta de Creador:</strong> Destinada a los adultos mayores o autores que subirán sus historias. Para activar este perfil, la empresa implementará un proceso de validación de identidad ("Conoce a tu Cliente" o KYC), donde se solicitarán documentos de identidad vigentes para mitigar fraudes o suplantaciones.</li>
          </ul>

          <h3 className="font-bold mb-2">5. MODELO DE NEGOCIO, TARIFAS Y DISTRIBUCIÓN DE INGRESOS</h3>
          <p className="mb-2">El acceso al Contenido de los Creadores se realiza bajo un modelo de suscripción de pago. División de Ingresos: Por cada suscripción efectivamente pagada por un Suscriptor, los ingresos netos (deduciendo comisiones de pasarelas de pago e impuestos aplicables) se distribuirán de la siguiente manera:</p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>80% corresponderá al Creador de la historia.</li>
            <li>20% corresponderá a Past Finder en concepto de comisión por uso de infraestructura, mantenimiento técnico y administración.</li>
          </ul>
          <p className="mb-4">La plataforma se reserva el derecho de modificar estos porcentajes o de incluir opciones de propinas, compras de historias individuales o mensajes de pago, lo cual será debidamente notificado.</p>

          <h3 className="font-bold mb-2">6. BILLETERA DIGITAL INTERNA Y RETIRO DE FONDOS</h3>
          <p className="mb-4">La plataforma dispondrá de una billetera digital interna dentro del panel del Creador, donde este podrá visualizar el saldo acumulado de sus ganancias netas tras la validación de los pagos de sus suscriptores.<br/>
          <strong>Monto Mínimo de Retiro:</strong> Para que el botón de solicitud se encuentre activo, el Creador deberá alcanzar un saldo mínimo acumulado de $10.000 CLP.</p>

          <h3 className="font-bold mb-2">7. POLÍTICA DE CONTENIDO Y PROPIEDAD INTELECTUAL</h3>
          <p className="mb-4">Cada Creador conserva los derechos morales y de propiedad intelectual sobre las historias que redacta y publica en la plataforma. Al subirlas, otorga a la plataforma una licencia no exclusiva, mundial y sublicenciable para alojar, mostrar y distribuir dicho contenido a los suscriptores correspondientes.</p>

          <h3 className="font-bold mb-2">8. RECLAMOS, DEVOLUCIONES Y CANCELACIONES</h3>
          <p className="mb-4"><strong>Política de No Reembolso:</strong> Debido a la naturaleza del contenido digital de acceso inmediato, los pagos de las suscripciones no son reembolsables, salvo errores de cobro duplicado atribuibles directamente a la plataforma o fallas técnicas mayores del servicio debidamente comprobadas.</p>

          <h3 className="font-bold mb-2">9. PREVENCIÓN DE FRAUDE Y SEGURIDAD</h3>
          <p className="mb-4">Past Finder auditará de manera continua el comportamiento de las cuentas. Se procederá a la suspensión, bloqueo o anulación de saldos de las cuentas de Creadores o Suscriptores si se detectan comportamientos ilícitos.</p>

          <h3 className="font-bold mb-2">10 a 14. POLÍTICAS GENERALES</h3>
          <p className="mb-4">El tratamiento de datos personales se rige bajo la Política de Privacidad. La empresa actúa como intermediario técnico y no es responsable por opiniones en las historias. Se prohíbe el scraping. Leyes aplicables: República de Chile.</p>
        </section>

        <hr className="my-8 border-heritage-gold/20" />

        <section>
          <h2 className="text-xl font-bold text-deep-navy mb-4">POLÍTICA DE PRIVACIDAD</h2>
          
          <p className="mb-4"><strong>Responsable:</strong> Juanny Ramirez Colque (RUT 14.727.633-8)<br/>
          <strong>Correo:</strong> pastfinder.oficial@gmail.com</p>

          <h3 className="font-bold mb-2">DATOS QUE RECOPILAMOS</h3>
          <p className="mb-4">Datos comunes (nombre, correo), datos de validación KYC para Creadores (documento de identidad, selfie), datos financieros para retiros, e información de uso técnico.</p>

          <h3 className="font-bold mb-2">FINALIDAD DEL TRATAMIENTO</h3>
          <p className="mb-4">Registrar cuentas, procesar pagos, prevenir fraudes, administrar la billetera digital y cumplir obligaciones legales.</p>

          <h3 className="font-bold mb-2">SEGURIDAD Y COMPARTICIÓN</h3>
          <p className="mb-4">Los datos no se venden. Se comparten exclusivamente con pasarelas de pago (Mercado Pago), servidores de nube y autoridades si es requerido legalmente. Implementamos cifrado SSL/TLS.</p>

          <h3 className="font-bold mb-2">DERECHOS DEL USUARIO (ARCO)</h3>
          <p className="mb-4">Puedes solicitar Acceso, Rectificación, Cancelación u Oposición enviando un correo a pastfinder.oficial@gmail.com con el asunto "Protección de Datos".</p>
          
          <h3 className="font-bold mb-2">MENORES DE EDAD</h3>
          <p className="mb-4">Prohibido el registro de menores de 18 años.</p>
        </section>
      </div>
    ),
  });
}
