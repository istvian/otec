import PDFDocument from "pdfkit";

const AZUL = "#001f47";
const CELESTE = "#00b4e7";
const GRIS = "#64748b";
const BORDE = "#cbd5e1";
const FONDO_SUAVE = "#f8fafc";

const formatoCLP = (monto: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(monto) ? monto : 0);

const formatoFecha = (fecha: Date | string | undefined) => {
  if (!fecha) return "No informada";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "No informada";
  return d.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const codigoCotizacion = (id: number) =>
  `COT-${String(id).padStart(5, "0")}`;

export interface PdfCotizacionData {
  id: number;
  nombreCliente?: string | null;
  clienteRut?: string | null;
  clienteDireccion?: string | null;
  contactoNombre?: string | null;
  contactoCorreo?: string | null;
  contactoTelefono?: string | null;
  nombreCurso?: string | null;
  objetivosCustom?: string | null;
  temarioCustom?: string | null;
  cantidadAlumnos: number;
  valorAlumno: number;
  descuento?: number | null;
  subtotal?: number | null;
  total: number;
  estado?: string | null;
  validezDias?: number | null;
  observaciones?: string | null;
  condiciones?: string | null;
  fechaEmision?: Date | string | null;
  curso?: {
    codigo?: string | null;
    nombre?: string | null;
    modalidad?: string | null;
    horas?: number | null;
  } | null;
  vendedor?: {
    nombre?: string | null;
    correo?: string | null;
  } | null;
}

export interface PdfCotizacionOpciones {
  urlPublica: string;
  nombreEmpresa?: string;
}

export function generarCotizacionPdf(
  cotizacion: PdfCotizacionData,
  opciones: PdfCotizacionOpciones,
): PDFKit.PDFDocument {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    info: {
      Title: `Cotización ${codigoCotizacion(cotizacion.id)}`,
      Author: opciones.nombreEmpresa || "KeepLearning",
      Subject: cotizacion.nombreCurso || "Cotización de capacitación",
    },
  });

  const anchoPagina =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const limiteInferior = () => doc.page.height - doc.page.margins.bottom - 30;

  const asegurarEspacio = (alto: number) => {
    if (doc.y + alto > limiteInferior()) {
      doc.addPage();
    }
  };

  const dibujarPie = () => {
    const y = doc.page.height - doc.page.margins.bottom - 18;
    doc
      .save()
      .font("Helvetica")
      .fontSize(8)
      .fillColor(GRIS)
      .text(
        `Documento generado electrónicamente · ${opciones.nombreEmpresa || "KeepLearning"}`,
        doc.page.margins.left,
        y,
        { width: anchoPagina, align: "left", lineBreak: false },
      )
      .restore();
  };

  const seccion = (titulo: string) => {
    asegurarEspacio(34);
    doc.moveDown(0.6);
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(AZUL)
      .text(titulo.toUpperCase(), doc.page.margins.left, doc.y, {
        width: anchoPagina,
        characterSpacing: 0.5,
      });
    const y = doc.y + 3;
    doc
      .moveTo(doc.page.margins.left, y)
      .lineTo(doc.page.margins.left + anchoPagina, y)
      .lineWidth(1)
      .strokeColor(CELESTE)
      .stroke();
    doc.moveDown(0.45);
  };

  const parrafo = (texto?: string | null, vacio = "No informado") => {
    const contenido = (texto || "").trim() || vacio;
    asegurarEspacio(26);
    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor("#1e293b")
      .text(contenido, doc.page.margins.left, doc.y, {
        width: anchoPagina,
        lineGap: 2,
      });
  };

  const campo = (etiqueta: string, valor: string, x: number, y: number, ancho: number) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor(GRIS)
      .text(etiqueta.toUpperCase(), x, y, { width: ancho });
    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor("#0f172a")
      .text(valor || "No informado", x, y + 11, { width: ancho });
  };

  // ================= ENCABEZADO =================
  doc
    .rect(0, 0, doc.page.width, 8)
    .fillColor(AZUL)
    .fill();

  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor(AZUL)
    .text(opciones.nombreEmpresa || "KeepLearning", doc.page.margins.left, 46, {
      width: anchoPagina * 0.58,
    });
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(GRIS)
    .text("Capacitación y formación profesional", {
      width: anchoPagina * 0.58,
    });

  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor(AZUL)
    .text("COTIZACIÓN", doc.page.margins.left + anchoPagina * 0.62, 46, {
      width: anchoPagina * 0.38,
      align: "right",
    });
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(CELESTE)
    .text(codigoCotizacion(cotizacion.id), {
      width: anchoPagina * 0.38,
      align: "right",
    });
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(GRIS)
    .text(`Emitida: ${formatoFecha(cotizacion.fechaEmision || undefined)}`, {
      width: anchoPagina * 0.38,
      align: "right",
    })
    .text(`Estado: ${cotizacion.estado || "Borrador"}`, {
      width: anchoPagina * 0.38,
      align: "right",
    });

  const fechaEmision = new Date(cotizacion.fechaEmision || Date.now());
  const fechaVencimiento = new Date(fechaEmision);
  fechaVencimiento.setDate(
    fechaVencimiento.getDate() + Number(cotizacion.validezDias || 15),
  );
  doc.text(`Válida hasta: ${formatoFecha(fechaVencimiento)}`, {
    width: anchoPagina * 0.38,
    align: "right",
  });

  const ySeparador = Math.max(doc.y + 10, 128);
  doc
    .moveTo(doc.page.margins.left, ySeparador)
    .lineTo(doc.page.margins.left + anchoPagina, ySeparador)
    .lineWidth(2)
    .strokeColor(AZUL)
    .stroke();
  doc.y = ySeparador + 14;

  // ================= CLIENTE / EJECUTIVO =================
  const mitad = anchoPagina / 2 - 12;
  const yBloque = doc.y;

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(AZUL)
    .text("CLIENTE", doc.page.margins.left, yBloque);
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(AZUL)
    .text("EJECUTIVO COMERCIAL", doc.page.margins.left + anchoPagina / 2 + 12, yBloque);

  campo(
    "Razón social",
    cotizacion.nombreCliente || "",
    doc.page.margins.left,
    yBloque + 14,
    mitad,
  );
  campo(
    "RUT",
    cotizacion.clienteRut || "",
    doc.page.margins.left,
    yBloque + 42,
    mitad,
  );
  campo(
    "Dirección",
    cotizacion.clienteDireccion || "",
    doc.page.margins.left,
    yBloque + 70,
    mitad,
  );
  campo(
    "Contacto",
    [cotizacion.contactoNombre, cotizacion.contactoCorreo]
      .filter(Boolean)
      .join(" · "),
    doc.page.margins.left,
    yBloque + 98,
    mitad,
  );

  campo(
    "Nombre",
    cotizacion.vendedor?.nombre || "",
    doc.page.margins.left + anchoPagina / 2 + 12,
    yBloque + 14,
    mitad,
  );
  campo(
    "Correo",
    cotizacion.vendedor?.correo || "",
    doc.page.margins.left + anchoPagina / 2 + 12,
    yBloque + 42,
    mitad,
  );

  doc.y = yBloque + 132;

  // ================= PROGRAMA =================
  seccion("1. Antecedentes del programa");
  parrafo(
    [
      cotizacion.nombreCurso || cotizacion.curso?.nombre || "Programa de capacitación",
      cotizacion.curso?.codigo ? `Código SENCE: ${cotizacion.curso.codigo}` : "",
      cotizacion.curso?.modalidad ? `Modalidad: ${cotizacion.curso.modalidad}` : "",
      cotizacion.curso?.horas ? `Horas: ${cotizacion.curso.horas}` : "",
    ]
      .filter(Boolean)
      .join("   |   "),
  );

  seccion("2. Objetivos");
  parrafo(cotizacion.objetivosCustom, "Sin objetivos informados.");

  seccion("3. Temario del curso");
  parrafo(cotizacion.temarioCustom, "Sin temario informado.");

  // ================= VALORES =================
  seccion("4. Detalle de valores");
  const columnas = [0, anchoPagina * 0.46, anchoPagina * 0.66, anchoPagina * 0.82];
  const anchoColumna = [
    anchoPagina * 0.46,
    anchoPagina * 0.2,
    anchoPagina * 0.16,
    anchoPagina * 0.18,
  ];

  const filaTabla = (
    valores: string[],
    opcionesFila: { negrita?: boolean; fondo?: string; color?: string } = {},
  ) => {
    asegurarEspacio(24);
    const y = doc.y;
    const alto = 20;
    if (opcionesFila.fondo) {
      doc.rect(doc.page.margins.left, y, anchoPagina, alto).fill(opcionesFila.fondo);
    }
    doc
      .font(opcionesFila.negrita ? "Helvetica-Bold" : "Helvetica")
      .fontSize(9)
      .fillColor(opcionesFila.color || "#1e293b");
    valores.forEach((valor, indice) => {
      doc.text(valor, doc.page.margins.left + columnas[indice] + 6, y + 6, {
        width: anchoColumna[indice] - 12,
        align: indice === 0 ? "left" : "right",
        lineBreak: false,
      });
    });
    doc
      .moveTo(doc.page.margins.left, y + alto)
      .lineTo(doc.page.margins.left + anchoPagina, y + alto)
      .lineWidth(0.6)
      .strokeColor(BORDE)
      .stroke();
    doc.x = doc.page.margins.left;
    doc.y = y + alto;
  };

  filaTabla(["Descripción", "Participantes", "Valor unitario", "Total"], {
    negrita: true,
    fondo: FONDO_SUAVE,
  });
  filaTabla([
    cotizacion.nombreCurso || cotizacion.curso?.nombre || "Programa de capacitación",
    String(cotizacion.cantidadAlumnos),
    formatoCLP(cotizacion.valorAlumno),
    formatoCLP(cotizacion.subtotal ?? cotizacion.cantidadAlumnos * cotizacion.valorAlumno),
  ]);

  if (Number(cotizacion.descuento || 0) > 0) {
    filaTabla(["Descuento aplicado", "", "", `- ${formatoCLP(Number(cotizacion.descuento))}`]);
  }

  filaTabla(["TOTAL NETO", "", "", formatoCLP(cotizacion.total)], {
    negrita: true,
    fondo: "#e0f2fe",
    color: AZUL,
  });

  doc.moveDown(0.8);
  asegurarEspacio(40);
  doc
    .font("Helvetica-Oblique")
    .fontSize(8)
    .fillColor(GRIS)
    .text(
      "Valores expresados en pesos chilenos (CLP). El total se calcula como cantidad de participantes por valor por alumno, menos descuentos aplicados.",
      { width: anchoPagina },
    );

  if (cotizacion.observaciones?.trim()) {
    seccion("5. Observaciones");
    parrafo(cotizacion.observaciones);
  }

  if (cotizacion.condiciones?.trim()) {
    seccion("6. Condiciones comerciales");
    parrafo(cotizacion.condiciones);
  }

  // ================= ENLACE PÚBLICO =================
  asegurarEspacio(54);
  doc.moveDown(1);
  const yEnlace = doc.y;
  doc
    .roundedRect(doc.page.margins.left, yEnlace, anchoPagina, 44, 6)
    .fillColor(FONDO_SUAVE)
    .fill()
    .lineWidth(0.8)
    .strokeColor(BORDE)
    .stroke();
  doc
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .fillColor(AZUL)
    .text("VERSIÓN WEB DE SOLO LECTURA", doc.page.margins.left + 12, yEnlace + 9);
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#1e293b")
    .text(opciones.urlPublica, doc.page.margins.left + 12, yEnlace + 23, {
      width: anchoPagina - 24,
      link: opciones.urlPublica,
      underline: true,
    });

  dibujarPie();
  return doc;
}

export default { generarCotizacionPdf };
