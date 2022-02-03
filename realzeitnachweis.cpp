#include <iostream>
#include <math.h>
#include <string> 
#include <fstream>
#include <vector>
#include <sstream>
#include <algorithm>


using namespace std; 

int anzahl_kerne, anzahl_prios;


struct PROCESS {
    unsigned char name;
    int tPmini;
    int tDmini;
    int tDmaxi;
    int tPhi;
    int tEmini;
    int tEmaxi;
    int prio;
    int tRmini;
    int tRmaxi;
};

vector<PROCESS> prozesse;



int read_data() {
    cout<<"beginn"<<endl;
    fflush(stdout);
    ifstream mycsv;
    mycsv.open("prozesse.csv", ios_base::in);

    std::string::size_type sz;   // alias of size_t
    string line;
    //string field;
    PROCESS temp;
    int i = 0;
    if (mycsv.is_open()) {
        cout<<"Datei ist offen"<<endl;
        //getline(mycsv, line); // ignore header
        getline(mycsv, line);
        while (getline(mycsv, line)) {
            i = 0;
            istringstream s(line);
            string field;
            //cout<<"line: "<<line<<std::endl;
            while(getline(s, field, ';')) {
                remove(field.begin(), field.end(), ' ');
                remove(field.begin(), field.end(), '\n');
                remove(field.begin(), field.end(), '\t');
                switch(i) {
                    case 0: temp.name = (char) field[0]; break;
                    case 1: temp.tPmini = stoi(field); break;
                    case 2: temp.tDmini = stoi(field); break;
                    case 3: temp.tDmaxi = stoi(field);break;
                    case 4: temp.tPhi = stoi(field);break;
                    case 5: temp.tEmini= stoi(field);break;
                    case 6: temp.tEmaxi = stoi(field);break;
                    case 7: temp.prio = stoi(field);break;
                    default: cout<<"komische sache"<<endl;break;
                }
                i++;
            }
            temp.tRmini = temp.tEmini;
            prozesse.push_back(temp);
        }
    } else {
        cout<<"kann Datein nicht öffnen"<<endl;
        return 1;
    }
}



bool auslastungsbedingung() {
    cout<<"-------AUSLASTUNGSBEDINGUNG--------\n"<<endl;
    double rhomaxges=0;
    cout<<"rhomax,ges = ";
    for(int i = 0; i<prozesse.size(); i++) {
        if(i != 0) {
            cout<<" + (" <<(double)prozesse.at(i).tEmaxi<<"/"<<(double)prozesse.at(i).tPmini<<")"; 
        } else {
            cout<<"(" <<(double)prozesse.at(i).tEmaxi<<"/"<<(double)prozesse.at(i).tPmini<<")"; 
        }
        rhomaxges += (double)prozesse.at(i).tEmaxi/(double)prozesse.at(i).tPmini;
    }
    //cout<<" = "<<rhomaxges<<endl;
    if(rhomaxges <= anzahl_kerne) {
        cout<<"\nAUSLASTUNGSBEDINGUNG ERFÜLLT rhomaxges = "<< rhomaxges<<" <= c = " << anzahl_kerne<<"\n"<<endl; 
        return true;
    } else {
        cout<<"\nAUSLASTUNGSBEDINGUNG NICHT! ERFÜLLT rhomaxges = "<< rhomaxges<<" > c = " << anzahl_kerne<<"\n"<<endl; 
        return false;
    }
}



bool utilization() {
    cout<<"---------UTILIZATION----------\n"<<endl;
    cout<<"s = "<<(double)prozesse.size()<<" * ( 2^(1/"<<(double)prozesse.size()<<") - 1)"<<endl;
    double s = (double)prozesse.size() * (pow(2, 1/(double)prozesse.size()) - 1);
    double min=0, u=0;
    cout<<"u = ";
    for(int i = 0; i<prozesse.size(); i++) {
        if(prozesse.at(i).tDmaxi < prozesse.at(i).tPmini ) min = (double)prozesse.at(i).tDmaxi;
        else min = (double)prozesse.at(i).tPmini;
        if(i != 0) {
            cout<<" + (" <<(double)prozesse.at(i).tEmaxi<<"/"<<min<<")"; 
        } else {
            cout<<"(" <<(double)prozesse.at(i).tEmaxi<<"/"<<(double)prozesse.at(i).tPmini<<")"; 
        }
        u += ((double)prozesse.at(i).tEmaxi)/min; 
    }
    if(u <= s) {
        cout<<"\nUtilization ERFÜLLT u = "<< u<<" <= s = " << s<<endl;
        cout<<"Alle RT-Anforderungen werden eingehalten :) Fertig"<<"\n"<<endl; 
        return true;
    } else {
        cout<<"\nUtilization NICHT! ERFÜLLT u = "<< u<<" > s = " << s<<"\n"<<endl;
        cout<<"musst weitermachen"<<endl;
        return false;
    }
}


int tC_berechnen(int prio) {
    cout<<"\n\n---------tC"<<prio<<"----------\n"<<endl;

    // Schritt 1: tCp Gleichung aufstellen
    for(int i = 0; i<prozesse.size(); i++) {
        if(prozesse.at(i).prio <= prio) {
            if(i != 0) {
                cout<<" + (" <<" |^ t/"<<prozesse.at(i).tPmini<<" ms ^| * "<<prozesse.at(i).tEmaxi<<"ms )"; 
            } else {
                cout<<"(" <<" |^ t/"<<prozesse.at(i).tPmini<<" ms ^| * "<<prozesse.at(i).tEmaxi<<"ms )"; 
            }
        }
    }

    cout<<"\n\nStart Iteration"<<endl;
    
    // Schritt 2: Startwert tp1 errechnen
    int startwert=0;
    cout<<"\nStartwert: tp1= ";
    for(int i = 0; i<prozesse.size(); i++) {
        if(prozesse.at(i).prio <= prio) {
            if(i != 0) {
                cout<<"+ " <<prozesse.at(i).tEmaxi<<" "; 
            } else {
                cout<<prozesse.at(i).tEmaxi<<" "; 
            }
            startwert += prozesse.at(i).tEmaxi;
        }
    }
    cout<<" = "<<startwert<<" ms";

    // Schritt 3: Iteration

    int last=startwert, current=startwert, sum=0, count=0;
    do {
        sum = 0;
        cout<<"\ntc,"<<prio<<" ("<<current<<"ms) = ";
        // Schritt 1: tCp Gleichung aufstellen
        for(int i = 0; i<prozesse.size(); i++) {
            if(prozesse.at(i).prio <= prio) {
                if(i != 0) {
                    cout<<" + (" <<" |^ "<<current<<"ms /"<<prozesse.at(i).tPmini<<" ms ^| * "<<prozesse.at(i).tEmaxi<<")"; 
                } else {
                    cout<<"(" <<" |^ "<<current<<"ms /"<<prozesse.at(i).tPmini<<" ms ^| * "<<prozesse.at(i).tEmaxi<<")"; 
                }
                sum += ceil((double)current/(double)prozesse.at(i).tPmini) * prozesse.at(i).tEmaxi;
            }
        }
        last = current;
        current = sum; 
        count ++;
        cout<<"\n";
    }while(last != current);

    cout<<"\nStopp: tp"<<count-1<<" == tp"<<count<<endl;

    cout<<"tRmax,"<<prio<<" = "<<current<<" ms "<<endl;



    // tRmaxi bei allen Prozessen mit prio prio einsetzen
    for(int i = 0; i<prozesse.size(); i++) {
        if(prozesse.at(i).prio == prio) {
            prozesse.at(i).tRmaxi = current;
        }
    }

    return current;
}



int rechtzeitigkeitsbedingung() {
    cout<<"\n\n------Check Rechtueitigkeitsbedingung----------\n"<<endl;
    for(int i = 0; i < prozesse.size(); i++) {
        cout<<prozesse.at(i).name<<": "<<prozesse.at(i).tDmini<<"<="<<prozesse.at(i).tRmini<<"<="<<prozesse.at(i).tRmaxi<<"<="<<prozesse.at(i).tDmaxi;
        if((prozesse.at(i).tDmini<=prozesse.at(i).tRmini) && ( prozesse.at(i).tRmini <=prozesse.at(i).tRmaxi ) && (prozesse.at(i).tRmaxi<=prozesse.at(i).tDmaxi)) {
            cout<<"\n";
        } else {
            cout<<"  <---- X "<<endl;
        }
    }
}


int vanilla() {

}


int main(int argc, char *argv[]) {
    if(argc < 2) {
        anzahl_kerne = 1;
    } else {
        anzahl_kerne = stoi(argv[1]);
        if(argc < 3) {
            anzahl_prios = 1;
        } else {
            anzahl_prios = stoi(argv[2]);
        }
    }
    bool a; 
    read_data();
    // ist schritthaltendes Scheduling prinzipiell möglich? 
    a = auslastungsbedingung();
    if(a) {
        // auslastungsbedingung erfüllt
        // notwendiger Scheduling Test
        a = utilization();
        if(!a) {
            // utilization nicht erfüllt
            // iteration machen
            for(int i = 1; i <= anzahl_prios; i++) {
                tC_berechnen(i);
            }    
            rechtzeitigkeitsbedingung();
        }
    }
    return 0;
}

