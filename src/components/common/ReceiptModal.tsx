import React from 'react';
import { Printer, X, CheckCircle, Share2, Sparkles } from 'lucide-react';
import { Sale, StoreSettings } from '../../types';
import { db } from '../../services/db';

interface ReceiptModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, isOpen, onClose }) => {
  if (!isOpen || !sale) return null;

  const settings: StoreSettings = db.getSettings();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 animate-fade-in flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-stone-50 print:hidden">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-stone-900 text-base">Comprovante de Venda #{sale.saleNumber}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="p-6 overflow-y-auto font-mono text-xs text-stone-800 space-y-4 bg-amber-50/20">
          {/* Header */}
          <div className="text-center border-b border-dashed border-stone-300 pb-3 space-y-1">
            <div className="flex justify-center items-center space-x-1.5 text-amber-800 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="font-serif font-bold text-sm tracking-wider uppercase">{settings.storeName}</span>
            </div>
            <div className="text-[11px] text-stone-600">{settings.address}</div>
            <div className="text-[11px] text-stone-600">CNPJ: {settings.cnpj} • Tel: {settings.phone}</div>
            <div className="text-[10px] text-stone-500 uppercase tracking-widest pt-1">
              Documento Não Fiscal - Cupom de Venda
            </div>
          </div>

          {/* Sale Info */}
          <div className="border-b border-dashed border-stone-300 pb-3 text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-stone-500">VENDA Nº:</span>
              <span className="font-bold">#{sale.saleNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">DATA / HORA:</span>
              <span>
                {new Date(sale.date).toLocaleDateString('pt-BR')} {new Date(sale.date).toLocaleTimeString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">OPERADOR(A):</span>
              <span>{sale.userName}</span>
            </div>
            {sale.sellerName && (
              <div className="flex justify-between">
                <span className="text-stone-500">VENDEDOR(A):</span>
                <span className="font-bold text-amber-900">{sale.sellerName}</span>
              </div>
            )}
            {sale.customerName && (
              <div className="flex justify-between">
                <span className="text-stone-500">CLIENTE:</span>
                <span className="font-bold">{sale.customerName} {sale.customerDocument ? `(${sale.customerDocument})` : ''}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="border-b border-dashed border-stone-300 pb-3">
            <div className="font-bold text-[11px] mb-2 flex justify-between border-b border-stone-200 pb-1">
              <span>ITEM / DESCRIÇÃO</span>
              <span>TOTAL</span>
            </div>
            <div className="space-y-2">
              {sale.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-semibold text-stone-900">{item.productName}</div>
                  <div className="flex justify-between text-stone-600 text-[11px]">
                    <span>
                      {item.quantity} un x R$ {item.unitPrice.toFixed(2)}
                      {item.discount > 0 ? ` (Desc: -R$ ${item.discount.toFixed(2)})` : ''}
                    </span>
                    <span className="font-bold text-stone-900">R$ {item.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-1.5 border-b border-dashed border-stone-300 pb-3 text-[11px]">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal Itens:</span>
              <span>R$ {sale.subtotal.toFixed(2)}</span>
            </div>
            {sale.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Desconto Total:</span>
                <span>- R$ {sale.discountTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-stone-900 pt-1 border-t border-stone-200">
              <span>VALOR TOTAL:</span>
              <span className="text-amber-700">R$ {sale.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payments */}
          <div className="border-b border-dashed border-stone-300 pb-3 text-[11px] space-y-1">
            <div className="font-bold text-stone-700 mb-1">FORMA(S) DE PAGAMENTO:</div>
            {sale.payments.map((p, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{p.method}:</span>
                <span className="font-semibold">R$ {p.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Footer message */}
          <div className="text-center pt-2 space-y-1 text-[11px] text-stone-600">
            <p className="italic">{settings.receiptFooterMessage}</p>
            <p className="text-[10px] text-stone-400">Sistema de Gestão Perfumaria Elegance</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-end space-x-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-200 rounded-xl transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md flex items-center space-x-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Cupom</span>
          </button>
        </div>
      </div>
    </div>
  );
};
